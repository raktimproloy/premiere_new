import bcrypt from "bcryptjs";
import { generateToken, verifyToken, JWTPayload } from "./jwt";
import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  password: string;
  profileImage?: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  emailVerified: boolean;
  guestId?: number; // Add guest ID from OwnerRez
  registerType?: 'manual' | 'google' | 'facebook' | 'apple'; // Add register type
  // Admin-specific fields
  contactPerson?: string;
  mailingAddress?: string;
  desiredService?: string;
  // Business fields
  proofOfOwnership?: string;
  businessLicenseNumber?: string;
  taxId?: string;
  bankAccountInfo?: string;
  taxForm?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  bookingIds?: string[]; // Add this line for booking IDs
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

export const authService = {
  async signup(userData: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    password: string;
    profileImage?: string;
    guestId?: number; // Add guest ID parameter
    registerType?: 'manual' | 'google' | 'facebook' | 'apple'; // Add register type
    role?: string; // Add role parameter
    // Admin-specific fields
    contactPerson?: string;
    mailingAddress?: string;
    desiredService?: string;
      // Business fields
  proofOfOwnership?: string;
    businessLicenseNumber?: string;
    taxId?: string;
    bankAccountInfo?: string;
    taxForm?: string;
  }): Promise<AuthResponse> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({
        email: userData.email.toLowerCase()
      });

      if (existingUser) {
        return {
          success: false,
          message: "User already exists with this email",
          error: "EMAIL_EXISTS"
        };
      }

      // Hash password only if it's not empty (for Google users)
      const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : '';

      // Debug logging for role assignment
      console.log('Signup role debug:', {
        receivedRole: userData.role,
        roleType: typeof userData.role,
        isValidRole: userData.role && ['user', 'admin'].includes(userData.role)
      });

      // Create new user
      const newUser = {
        fullName: userData.fullName,
        email: userData.email.toLowerCase(),
        phone: userData.phone,
        dob: userData.dob,
        password: hashedPassword,
        profileImage: userData.profileImage || "",
        role: (userData.role && userData.role !== '' && ['user', 'admin'].includes(userData.role)) ? userData.role as 'user' | 'admin' : 'user',
        isActive: true,
        emailVerified: (userData.registerType === 'google' || userData.registerType === 'facebook' || userData.registerType === 'apple') ? true : false, // Social accounts are verified
        guestId: userData.guestId, // Store the guest ID
        registerType: userData.registerType || 'manual', // Store register type
        // Admin-specific fields (only save if role is admin)
        ...(userData.role === 'admin' && {
          contactPerson: userData.contactPerson || '',
          mailingAddress: userData.mailingAddress || '',
          desiredService: userData.desiredService || '',
                  // Business fields
        proofOfOwnership: userData.proofOfOwnership || '',
          businessLicenseNumber: userData.businessLicenseNumber || '',
          taxId: userData.taxId || '',
          bankAccountInfo: userData.bankAccountInfo || '',
          taxForm: userData.taxForm || ''
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      console.log('Final user role:', newUser.role);

      const result = await db.collection("users").insertOne(newUser);
      const userId = result.insertedId.toString();

      // Generate JWT token
      const token = generateToken({
        userId: userId,
        email: newUser.email,
        role: newUser.role
      });

      return {
        success: true,
        message: "User registered successfully",
        user: { ...newUser, _id: userId },
        token
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "Registration failed",
        error: "REGISTRATION_FAILED"
      };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      // Find user by email
      const user = await db.collection("users").findOne({
        email: email.toLowerCase()
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
          error: "INVALID_CREDENTIALS"
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: "Account is deactivated",
          error: "ACCOUNT_DEACTIVATED"
        };
      }

      // For social login users, skip password verification
      if (user.registerType === 'google' || user.registerType === 'facebook' || user.registerType === 'apple') {
        console.log(`${user.registerType} user login - skipping password verification`);
      } else {
        // Verify password for manual users
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return {
            success: false,
            message: "Invalid email or password",
            error: "INVALID_CREDENTIALS"
          };
        }
      }

      // Update last login
      await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date(), updatedAt: new Date() } }
      );

      // Generate JWT token
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        message: "Login successful",
        user: user as unknown as User,
        token
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Login failed",
        error: "LOGIN_FAILED"
      };
    }
  },

  async verifyToken(token: string): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        return { valid: false, error: "INVALID_TOKEN" };
      }

      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const user = await db.collection("users").findOne({
        _id: new ObjectId(decoded.userId),
        isActive: true
      });

      if (!user) {
        return { valid: false, error: "USER_NOT_FOUND" };
      }

      return { valid: true, user: user as unknown as User };
    } catch (error) {
      console.error("Token verification error:", error);
      return { valid: false, error: "TOKEN_VERIFICATION_FAILED" };
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const user = await db.collection("users").findOne({
        _id: new ObjectId(userId),
        isActive: true
      });

      return user as User | null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }
}; 