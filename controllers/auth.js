const passport = require('passport');
require('dotenv').config();
const db = require('../config/db');

const GOOGLE_CLIENT_ID = "369363928740-fp64u45inlhgslnrt5bp3s4gl7ohm8d6.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

//........Google Auth.................

const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/google/callback", // Matches the route in authRoute.js
    passReqToCallback: true,
    // Add these options to ensure fresh login every time
    prompt: 'select_account'
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      console.log('Google profile:', profile);
      
      // Extract email from profile object
      const email = profile.emails && profile.emails.length > 0 
        ? profile.emails[0].value 
        : null;
      
      if (!email) {
        console.error('No email found in Google profile');
        return done(null, false, { message: 'No email found in profile' });
      }
      
      console.log('Using email:', email);
      
      // Check if user already exists in DB - use await with db.query
      const [rows] = await db.query("SELECT * FROM students WHERE email = ?", [email]);
      
      if (rows.length === 0) {
        // If not, create a new user
        const newStudent = {
          name: profile.displayName || 'Google User',
          email: email,
          semester: "",
          password: ""
        };
        
        await db.query(
          "INSERT INTO students (name, email, semester, password) VALUES (?, ?, ?, ?)",
          [newStudent.name, newStudent.email, newStudent.semester, newStudent.password]
        );
      }
      
      return done(null, profile);
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return done(error);
    }

    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

//..........Facebook Auth...................

const FACEBOOK_APP_ID = "1893271151591415"
const FACEBOOK_APP_SECRET = "94b9a946b497ee9d04216ef744dccd68"

const FacebookStrategy = require('passport-facebook').Strategy;
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:4000/api/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'name', 'picture']
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      console.log('Facebook profile:', profile);
      
      // Get email from Facebook profile (if available)
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (!email) {
        console.warn('No email found in Facebook profile, using ID instead');
      }
      
      // Use email or facebook ID as identifier
      const identifier = email || `fb-${profile.id}`;
      
      // Check if user exists
      const [rows] = await db.query("SELECT * FROM students WHERE email = ?", [identifier]);
      
      if (rows.length === 0) {
        // If not, create a new user
        const newStudent = {
          name: profile.displayName || 'Facebook User',
          email: identifier,
          semester: "",
          password: ""
        };
        
        await db.query(
          "INSERT INTO students (name, email, semester, password) VALUES (?, ?, ?, ?)",
          [newStudent.name, newStudent.email, newStudent.semester, newStudent.password]
        );
      }
      
      return done(null, profile);
    } catch (error) {
      console.error('Error during Facebook authentication:', error);
      return done(error);
    }
  }
));
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});