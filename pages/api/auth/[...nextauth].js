import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import Creator from '@/models/Creator';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        await dbConnect();
        
        const creator = await Creator.findOne({ email: credentials.email });
        if (!creator) {
          throw new Error('Email atau password salah');
        }

        const isValid = await bcrypt.compare(credentials.password, creator.password);
        if (!isValid) {
          throw new Error('Email atau password salah');
        }

        return {
          id: creator._id.toString(),
          email: creator.email,
          name: creator.displayName,
          username: creator.username
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        await dbConnect();
        
        // Check if user exists
        let creator = await Creator.findOne({ email: user.email });
        
        if (!creator) {
          // Auto-create creator for Google OAuth
          const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
          
          creator = await Creator.create({
            email: user.email,
            displayName: user.name || username,
            username: username + '_' + Date.now().toString().slice(-4),
            password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
            isActive: true,
            oauthProvider: 'google',
            oauthId: profile.sub
          });
        }
        
        user.id = creator._id.toString();
        user.username = creator.username;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
