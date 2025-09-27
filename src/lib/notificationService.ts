import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface CreateNotificationData {
  userId: string; // Input parameter - will be converted to ObjectId
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string; // Input parameter - will be converted to ObjectId
  relatedType?: 'booking' | 'property' | 'review' | 'contact';
}

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: ObjectId;
  relatedType?: 'booking' | 'property' | 'review' | 'contact';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: CreateNotificationData): Promise<Notification | null> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");

    const notification: Notification = {
      userId: new ObjectId(data.userId), // Convert string to ObjectId
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      relatedId: data.relatedId ? new ObjectId(data.relatedId) : undefined, // Convert string to ObjectId
      relatedType: data.relatedType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection("notifications").insertOne(notification);
    
    if (result.insertedId) {
      return { ...notification, _id: result.insertedId };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create notification for property owner when booking is made
 */
export async function notifyPropertyOwnerBooking(propertyId: string, bookingId: string, guestName: string, propertyName: string, ownerId: string) {
  return await createNotification({
    userId: ownerId,
    title: 'New Booking Request',
    message: `${guestName} has made a booking request for ${propertyName}`,
    type: 'success',
    actionUrl: `/admin/bookings`,
    actionLabel: 'View Booking',
    relatedId: bookingId,
    relatedType: 'booking'
  });
}

/**
 * Create notification for admin when property is approved/rejected by superadmin
 */
export async function notifyAdminPropertyStatus(propertyId: string, propertyName: string, adminId: string, status: 'approved' | 'rejected') {
  const isApproved = status === 'approved';
  return await createNotification({
    userId: adminId,
    title: `Property ${isApproved ? 'Approved' : 'Rejected'}`,
    message: `Your property "${propertyName}" has been ${isApproved ? 'approved' : 'rejected'} by superadmin`,
    type: isApproved ? 'success' : 'warning',
    actionUrl: `/admin/properties`,
    actionLabel: 'View Properties',
    relatedId: adminId, // Use admin ID instead of property ID
    relatedType: 'property'
  });
}

/**
 * Create notification for superadmin when new property is submitted
 */
export async function notifySuperadminNewProperty(propertyId: string, propertyName: string, adminName: string, superadminId: string) {
  return await createNotification({
    userId: superadminId,
    title: 'New Property Submission',
    message: `${adminName} has submitted a new property "${propertyName}" for approval`,
    type: 'info',
    actionUrl: `/superadmin/properties`,
    actionLabel: 'Review Property',
    relatedId: superadminId, // Use superadmin ID instead of property ID
    relatedType: 'property'
  });
}

/**
 * Create notification for admin when booking is cancelled
 */
export async function notifyAdminBookingCancelled(bookingId: string, guestName: string, propertyName: string, adminId: string) {
  return await createNotification({
    userId: adminId,
    title: 'Booking Cancelled',
    message: `${guestName} has cancelled their booking for ${propertyName}`,
    type: 'warning',
    actionUrl: `/admin/bookings`,
    actionLabel: 'View Bookings',
    relatedId: bookingId,
    relatedType: 'booking'
  });
}

/**
 * Create notification for admin when new review is submitted
 */
export async function notifyAdminNewReview(reviewId: string, guestName: string, propertyName: string, adminId: string) {
  return await createNotification({
    userId: adminId,
    title: 'New Review',
    message: `${guestName} has submitted a review for ${propertyName}`,
    type: 'info',
    actionUrl: `/admin/reviews`,
    actionLabel: 'View Review',
    relatedId: adminId, // Use admin ID instead of review ID
    relatedType: 'review'
  });
}

/**
 * Create notification for admin when contact message is received
 */
export async function notifyAdminContactMessage(messageId: string, contactName: string, adminId: string) {
  return await createNotification({
    userId: adminId,
    title: 'New Contact Message',
    message: `You have received a new message from ${contactName}`,
    type: 'info',
    actionUrl: `/admin/contact`,
    actionLabel: 'View Message',
    relatedId: adminId, // Use admin ID instead of message ID
    relatedType: 'contact'
  });
}

/**
 * Get all superadmin users for notifications
 */
export async function getSuperadminUsers(): Promise<Array<{ _id: string; email: string; fullName: string }>> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    const superadmins = await db.collection("users")
      .find({ role: 'superadmin' }, { projection: { _id: 1, email: 1, fullName: 1 } })
      .toArray();
    
    return superadmins.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    }));
  } catch (error) {
    console.error('Error getting superadmin users:', error);
    return [];
  }
}

/**
 * Get property owner ID by property ID
 */
export async function getPropertyOwnerId(propertyId: string): Promise<string | null> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    const property = await db.collection("properties")
      .findOne({ _id: new ObjectId(propertyId) }, { projection: { 'owner.id': 1 } });
    
    return property?.owner?.id?.toString() || null;
  } catch (error) {
    console.error('Error getting property owner ID:', error);
    return null;
  }
}

/**
 * Get property owner ID by OwnerRez property ID
 */
export async function getPropertyOwnerIdByOwnerRezId(ownerRezPropertyId: number): Promise<string | null> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    const property = await db.collection("properties")
      .findOne({ ownerRezId: ownerRezPropertyId }, { projection: { 'owner.id': 1 } });
    
    return property?.owner?.id?.toString() || null;
  } catch (error) {
    console.error('Error getting property owner ID by OwnerRez ID:', error);
    return null;
  }
}

/**
 * Get property owner email by OwnerRez property ID and find user ID by email
 */
export async function getPropertyOwnerUserIdByOwnerRezId(ownerRezPropertyId: number): Promise<string | null> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    // First, get the property to find owner email
    const property = await db.collection("properties")
      .findOne({ ownerRezId: ownerRezPropertyId }, { projection: { 'owner.email': 1 } });
    
    if (!property?.owner?.email) {
      console.log('No owner email found for property:', ownerRezPropertyId);
      return null;
    }
    
    // Then, find the user by email to get the user ID
    const user = await db.collection("users")
      .findOne({ email: property.owner.email }, { projection: { _id: 1 } });
    
    return user?._id?.toString() || null;
  } catch (error) {
    console.error('Error getting property owner user ID by OwnerRez ID:', error);
    return null;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    const result = await db.collection("notifications").updateMany(
      { userId: userId, read: false },
      { $set: { read: true, updatedAt: new Date() } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db("premiere-stays");
    
    const count = await db.collection("notifications").countDocuments({
      userId: userId,
      read: false
    });
    
    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}