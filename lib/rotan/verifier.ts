import { VerificationRequest, VerificationCheck, RiskAssessment, CheckType } from '@/lib/types';
import { GATE_THRESHOLDS } from '@/lib/constants';
import { analyzeConfidenceLanguage, calculateOverallRisk } from './scorer';

const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, timeout: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function checkPackageExists(packageName: string): Promise<VerificationCheck> {
  try {
    const response = await fetchWithTimeout(`https://registry.npmjs.org/${packageName}`);
    
    if (response.status === 200) {
      const data = await response.json();
      return {
        checkType: 'EXISTENCE' as CheckType,
        passed: true,
        confidence: 1.0,
        evidence: `Package exists. Latest version: ${data['dist-tags']?.latest || 'unknown'}`,
        source: 'npm registry',
        freshness: 'LIVE',
        details: `Verified at ${new Date().toISOString()}`,
      };
    } else if (response.status === 404) {
      return {
        checkType: 'EXISTENCE' as CheckType,
        passed: false,
        confidence: 1.0,
        evidence: 'Package does not exist in npm registry',
        source: 'npm registry',
        freshness: 'LIVE',
        details: `404 response at ${new Date().toISOString()}`,
      };
    } else {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    return {
      checkType: 'EXISTENCE' as CheckType,
      passed: false,
      confidence: 0.5,
      evidence: 'Unable to verify package existence',
      source: 'npm registry',
      freshness: 'UNAVAILABLE',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function checkVersionExists(packageName: string, version: string): Promise<VerificationCheck> {
  try {
    const response = await fetchWithTimeout(`https://registry.npmjs.org/${packageName}`);
    
    if (response.status === 200) {
      const data = await response.json();
      const versions = Object.keys(data.versions || {});
      const versionExists = versions.includes(version) || versions.includes(`${version}.0`) || versions.includes(`${version}.0.0`);
      
      const majorVersions = [...new Set(versions.map(v => v.split('.')[0]))].sort();
      
      return {
        checkType: 'VERSION_VALIDITY' as CheckType,
        passed: versionExists,
        confidence: 1.0,
        evidence: versionExists 
          ? `Version ${version} exists. Available major versions: ${majorVersions.join(', ')}`
          : `Version ${version} not found. Available major versions: ${majorVersions.join(', ')}. Latest: ${data['dist-tags']?.latest}`,
        source: 'npm registry',
        freshness: 'LIVE',
        details: `Checked ${versions.length} versions at ${new Date().toISOString()}`,
      };
    } else {
      throw new Error(`Package not found: ${response.status}`);
    }
  } catch (error) {
    return {
      checkType: 'VERSION_VALIDITY' as CheckType,
      passed: false,
      confidence: 0.5,
      evidence: 'Unable to verify version',
      source: 'npm registry',
      freshness: 'UNAVAILABLE',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function checkGitHubRelease(owner: string, repo: string, tag: string): Promise<VerificationCheck> {
  try {
    const response = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/releases`);
    
    if (response.status === 200) {
      const releases = await response.json();
      const releaseExists = releases.some((r: any) => r.tag_name === tag || r.tag_name === `v${tag}`);
      const latestRelease = releases[0]?.tag_name || 'unknown';
      
      return {
        checkType: 'EXISTENCE' as CheckType,
        passed: releaseExists,
        confidence: 1.0,
        evidence: releaseExists
          ? `Release ${tag} exists. Latest release: ${latestRelease}`
          : `Release ${tag} not found. Latest release: ${latestRelease}`,
        source: `GitHub ${owner}/${repo}`,
        freshness: 'LIVE',
        details: `Checked ${releases.length} releases at ${new Date().toISOString()}`,
      };
    } else {
      throw new Error(`GitHub API error: ${response.status}`);
    }
  } catch (error) {
    return {
      checkType: 'EXISTENCE' as CheckType,
      passed: false,
      confidence: 0.5,
      evidence: 'Unable to verify GitHub release',
      source: `GitHub ${owner}/${repo}`,
      freshness: 'UNAVAILABLE',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export function extractClaimsFromResponse(response: string): string[] {
  const claims: string[] = [];
  
  // npm package names after import/require/install
  const packagePatterns = [
    /(?:import|require|from)\s+['"]([a-z0-9@\-\/]+)['"]/gi,
    /npm\s+install\s+([a-z0-9@\-\/]+)/gi,
    /yarn\s+add\s+([a-z0-9@\-\/]+)/gi,
  ];
  
  packagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      claims.push(`package:${match[1]}`);
    }
  });
  
  // Version numbers (vX.Y.Z or X.Y.Z)
  const versionPattern = /v?(\d+)\.(\d+)(?:\.(\d+))?/gi;
  let versionMatch;
  while ((versionMatch = versionPattern.exec(response)) !== null) {
    claims.push(`version:${versionMatch[0]}`);
  }
  
  // Framework + version combos
  const frameworkPatterns = [
    /(Next\.js|React|Vue|Angular|Svelte)\s+v?(\d+)/gi,
    /(TanStack Query|React Query)\s+v?(\d+)/gi,
  ];
  
  frameworkPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(response)) !== null) {
      claims.push(`framework:${match[1]}@${match[2]}`);
    }
  });
  
  // API methods (dot notation)
  const apiPattern = /\b([a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*)*)\s*\(/gi;
  let apiMatch;
  while ((apiMatch = apiPattern.exec(response)) !== null) {
    claims.push(`api:${apiMatch[1]}`);
  }
  
  return [...new Set(claims)]; // Remove duplicates
}

export async function verifyResponse(request: VerificationRequest): Promise<RiskAssessment> {
  const claims = extractClaimsFromResponse(request.rawResponse);
  const checks: VerificationCheck[] = [];
  
  // Process each claim
  for (const claim of claims) {
    const [type, value] = claim.split(':');
    
    if (type === 'package') {
      const check = await checkPackageExists(value);
      checks.push(check);
    } else if (type === 'framework') {
      const [framework, version] = value.split('@');
      
      // Map framework names to npm packages
      const packageMap: Record<string, string> = {
        'Next.js': 'next',
        'React': 'react',
        'Vue': 'vue',
        'Angular': '@angular/core',
        'Svelte': 'svelte',
        'TanStack Query': '@tanstack/react-query',
        'React Query': 'react-query',
      };
      
      const packageName = packageMap[framework];
      if (packageName) {
        const versionCheck = await checkVersionExists(packageName, version);
        checks.push(versionCheck);
        
        // Also check GitHub for major frameworks
        if (framework === 'Next.js') {
          const githubCheck = await checkGitHubRelease('vercel', 'next.js', `v${version}.0.0`);
          checks.push(githubCheck);
        }
      }
    } else if (type === 'api') {
      // Extract base package from API method
      const basePackage = value.split('.')[0];
      if (basePackage && basePackage.length > 2) {
        const check = await checkPackageExists(basePackage);
        checks.push(check);
      }
    }
  }
  
  // If no claims found, add a self-consistency check
  if (checks.length === 0) {
    checks.push({
      checkType: 'SELF_CONSISTENCY' as CheckType,
      passed: true,
      confidence: 0.8,
      evidence: 'No verifiable claims detected in response',
      source: 'ROTAN analyzer',
      freshness: 'LIVE',
      details: 'Response contains no package names, versions, or API methods to verify',
    });
  }
  
  // Calculate confidence level from language analysis
  const confidenceLevel = analyzeConfidenceLanguage(request.rawResponse);
  
  // Calculate overall risk using scorer
  return calculateOverallRisk(checks, confidenceLevel);
}

// Made with Bob
