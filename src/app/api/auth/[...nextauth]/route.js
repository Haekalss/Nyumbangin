import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import Creator from "@/models/Creator";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        
        const creator = await Creator.findOne({ email: credentials.email });
        
        if (!creator) {
          throw new Error("Email atau password salah");
        }
        
        // Check if user registered via Google OAuth
        if (creator.authProvider === 'google' && !creator.password) {
          throw new Error("Akun ini terdaftar dengan Google. Silakan login dengan Google.");
        }
        
        const isValid = await bcrypt.compare(credentials.password, creator.password);
        
        if (!isValid) {
          throw new Error("Email atau password salah");
        }
        
        // Update last login
        creator.lastLogin = new Date();
        creator.loginCount += 1;
        await creator.save();
        
        return {
          id: creator._id.toString(),
          email: creator.email,
          username: creator.username,
          displayName: creator.displayName,
          authProvider: creator.authProvider
        };
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await dbConnect();
        
        // Check if user exists with this Google ID
        let creator = await Creator.findOne({ googleId: profile.sub });
        
        if (!creator) {
          // Check if user exists with this email
          creator = await Creator.findOne({ email: profile.email });
          
          if (creator) {
            // Email exists but not linked to Google - link it
            creator.googleId = profile.sub;
            creator.authProvider = 'google';
            creator.isEmailVerified = true;
            creator.lastLogin = new Date();
            creator.loginCount += 1;
            await creator.save();
          } else {
            // New user - create account
            // Generate username from email
            const baseUsername = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
            let username = baseUsername;
            let counter = 1;
            
            // Ensure unique username
            while (await Creator.findOne({ username })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }
            
            creator = await Creator.create({
              email: profile.email,
              username: null, // Username kosong - user harus isi manual
              displayName: profile.name || 'User',
              password: null, // No password for OAuth users
              authProvider: 'google',
              googleId: profile.sub,
              isEmailVerified: true,
              profileImageId: null,
              lastLogin: new Date(),
              loginCount: 1
            });
            
            // Mark as needing username setup
            user.needsSetup = true;
          }
        } else {
          // Existing Google user - update last login
          creator.lastLogin = new Date();
          creator.loginCount += 1;
          await creator.save();
          
          // Check if username still not set (needs setup)
          if (!creator.username) {
            user.needsSetup = true;
          }
        }
        
        // Add creator data to user object
        user.id = creator._id.toString();
        user.username = creator.username;
        user.displayName = creator.displayName;
        user.authProvider = creator.authProvider;
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.displayName = user.displayName;
        token.authProvider = user.authProvider;
        token.needsSetup = user.needsSetup || false;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.displayName = token.displayName;
        session.user.authProvider = token.authProvider;
        session.user.needsSetup = token.needsSetup;
      }
      return session;
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
