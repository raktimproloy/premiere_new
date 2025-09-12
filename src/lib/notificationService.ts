import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string;
  relatedType?: 'booking' | 'property' | 'review' | 'contact';
}

export interface Notification {
  _id?: ObjectId;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedId?: string;
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
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel,
      relatedId: data.relatedId,
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
    relatedId: propertyId,
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
    relatedId: propertyId,
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
    relatedId: reviewId,
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
    relatedId: messageId,
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
      .findOne({ _id: new ObjectId(propertyId) }, { projection: { 'owner._id': 1 } });
    
    return property?.owner?._id?.toString() || null;
  } catch (error) {
    console.error('Error getting property owner ID:', error);
    return null;
  }
}
