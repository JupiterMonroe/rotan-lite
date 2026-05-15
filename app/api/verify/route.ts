import { NextRequest, NextResponse } from 'next/server';
import { verifyResponse } from '@/lib/rotan/verifier';
import { analyzeConfidenceLanguage, calculateOverallRisk } from '@/lib/rotan/scorer';
import { makeGateDecision } from '@/lib/rotan/gatekeeper';
import { createSession, updateTrustState } from '@/lib/rotan/trust-state';
import { SessionTrustState, InterventionEvent, VerificationRequest } from '@/lib/types';

// In-memory session storage
const sessionStore = new Map<string, SessionTrustState>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, rawResponse, sessionId } = body;
    
    if (!prompt || !rawResponse || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: prompt, rawResponse, sessionId' },
        { status: 400 }
      );
    }
    
    // Get or create session trust state
    let trustState = sessionStore.get(sessionId);
    if (!trustState) {
      trustState = createSession(sessionId);
      sessionStore.set(sessionId, trustState);
    }
    
    // Create verification request
    const verificationRequest: VerificationRequest = {
      prompt,
      rawResponse,
      timestamp: new Date(),
      sessionId,
    };
    
    // Run verification
    const riskAssessment = await verifyResponse(verificationRequest);
    
    // Make gate decision
    const gateDecision = makeGateDecision(riskAssessment, trustState);
    
    // Create intervention event
    const interventionEvent: InterventionEvent = {
      id: `intervention-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      prompt,
      gateDecision: {
        ...gateDecision,
        originalResponse: rawResponse,
      },
      riskAssessment,
      responseTimeMs: Date.now() - startTime,
    };
    
    // Update trust state
    const updatedTrustState = updateTrustState(trustState, interventionEvent);
    sessionStore.set(sessionId, updatedTrustState);
    
    const totalMs = Date.now() - startTime;
    
    // Return response
    return NextResponse.json({
      success: true,
      intervention: interventionEvent,
      trustState: updatedTrustState,
      timing: {
        totalMs,
      },
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Made with Bob
