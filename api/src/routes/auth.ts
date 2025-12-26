import { Router, Response, Request } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

// Google OAuth callback handler
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'idToken is required',
      });
    }

    // Sign in with Google ID token via Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: No user or session',
      });
    }

    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
          provider: 'google',
        },
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
});

// Email/password sign in
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Sign in failed',
      });
    }

    res.json({
      success: true,
      data: {
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
          provider: 'email',
        },
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      error: 'Sign in failed',
    });
  }
});

// Email/password sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Sign up failed',
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: 'Sign up failed',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          provider: 'email',
        },
        message: 'Sign up successful. Please check your email to confirm your account.',
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({
      success: false,
      error: 'Sign up failed',
    });
  }
});

// Sign out
router.post('/signout', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Sign out failed',
      });
    }

    res.json({
      success: true,
      message: 'Signed out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sign out failed',
    });
  }
});

export default router;
