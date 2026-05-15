import { NextRequest, NextResponse } from 'next/server';
import { extractClaimsFromResponse } from '@/lib/rotan/verifier';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }
    
    // Extract claims from the prompt
    const claims = extractClaimsFromResponse(prompt);
    
    // Determine what checks would be needed for each claim
    const checksPlanned = claims.map(claim => {
      const [type, value] = claim.split(':');
      
      if (type === 'package') {
        return {
          type: 'EXISTENCE',
          target: value,
          source: 'npm registry',
        };
      } else if (type === 'framework') {
        const [framework, version] = value.split('@');
        return {
          type: 'VERSION_VALIDITY',
          target: `${framework} v${version}`,
          source: 'npm registry + GitHub releases',
        };
      } else if (type === 'version') {
        return {
          type: 'VERSION_VALIDITY',
          target: value,
          source: 'npm registry',
        };
      } else if (type === 'api') {
        const basePackage = value.split('.')[0];
        return {
          type: 'EXISTENCE',
          target: `${basePackage} (for API ${value})`,
          source: 'npm registry',
        };
      } else {
        return {
          type: 'SELF_CONSISTENCY',
          target: value,
          source: 'ROTAN analyzer',
        };
      }
    });
    
    // Estimate time based on number of checks
    // Each check takes approximately 1-2 seconds (network calls)
    const estimatedTimeMs = checksPlanned.length * 1500;
    
    // Return analysis plan
    return NextResponse.json({
      success: true,
      plan: {
        claimsToVerify: claims,
        checksPlanned,
        estimatedTimeMs,
      },
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Made with Bob
