import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and check if user is superadmin
    const result = await authService.verifyToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only superadmin can view review dashboard
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can view review dashboard.' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Get current date for filtering
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Get overall statistics
    const overallStats = await db.collection("reviews").aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$stars' },
          pendingReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    // Get recent statistics (last 30 days)
    const recentStats = await db.collection("reviews").aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          recentReviews: { $sum: 1 },
          recentAverageRating: { $avg: '$stars' },
          recentPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          recentApproved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          recentRejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    // Get this week's statistics
    const weeklyStats = await db.collection("reviews").aggregate([
      {
        $match: {
          created_at: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          weeklyReviews: { $sum: 1 },
          weeklyAverageRating: { $avg: '$stars' }
        }
      }
    ]).toArray();

    // Get pending reviews (for quick action)
    const pendingReviews = await db.collection("reviews")
      .find({ status: 'pending' })
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    // Get top properties by review count
    const topProperties = await db.collection("reviews").aggregate([
      {
        $group: {
          _id: '$property_id',
          property_name: { $first: '$property.name' },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$stars' },
          approvedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalReviews: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Get monthly review trends (last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
    const monthlyTrends = await db.collection("reviews").aggregate([
      {
        $match: {
          created_at: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$stars' },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]).toArray();

    // Get rating distribution
    const ratingDistribution = await db.collection("reviews").aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: '$stars',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();

    // Process overall statistics
    const overall = overallStats.length > 0 ? overallStats[0] : {
      totalReviews: 0,
      averageRating: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0
    };

    // Process recent statistics
    const recent = recentStats.length > 0 ? recentStats[0] : {
      recentReviews: 0,
      recentAverageRating: 0,
      recentPending: 0,
      recentApproved: 0,
      recentRejected: 0
    };

    // Process weekly statistics
    const weekly = weeklyStats.length > 0 ? weeklyStats[0] : {
      weeklyReviews: 0,
      weeklyAverageRating: 0
    };

    // Process rating distribution
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach(item => {
      const rating = Math.round(item._id);
      if (rating >= 5) ratingDist[5] += item.count;
      else if (rating >= 4) ratingDist[4] += item.count;
      else if (rating >= 3) ratingDist[3] += item.count;
      else if (rating >= 2) ratingDist[2] += item.count;
      else ratingDist[1] += item.count;
    });

    // Process monthly trends
    const trends = monthlyTrends.map(trend => ({
      month: trend._id.month,
      year: trend._id.year,
      count: trend.count,
      averageRating: Math.round(trend.averageRating * 10) / 10,
      approvedCount: trend.approvedCount
    }));

    // Process top properties
    const topProps = topProperties.map(prop => ({
      property_id: prop._id,
      property_name: prop.property_name,
      totalReviews: prop.totalReviews,
      averageRating: Math.round(prop.averageRating * 10) / 10,
      approvedReviews: prop.approvedReviews
    }));

    // Process pending reviews
    const pending = pendingReviews.map(review => ({
      _id: review._id,
      display_name: review.display_name,
      stars: review.stars,
      property_name: review.property?.name,
      created_at: review.created_at,
      body: review.body.substring(0, 100) + (review.body.length > 100 ? '...' : '')
    }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalReviews: overall.totalReviews,
          averageRating: Math.round(overall.averageRating * 10) / 10,
          pendingReviews: overall.pendingReviews,
          approvedReviews: overall.approvedReviews,
          rejectedReviews: overall.rejectedReviews
        },
        recent: {
          last30Days: {
            reviews: recent.recentReviews,
            averageRating: Math.round(recent.recentAverageRating * 10) / 10,
            pending: recent.recentPending,
            approved: recent.recentApproved,
            rejected: recent.recentRejected
          },
          last7Days: {
            reviews: weekly.weeklyReviews,
            averageRating: Math.round(weekly.weeklyAverageRating * 10) / 10
          }
        },
        ratingDistribution: ratingDist,
        topProperties: topProps,
        monthlyTrends: trends,
        pendingReviews: pending,
        summary: {
          approvalRate: overall.totalReviews > 0 ? 
            Math.round((overall.approvedReviews / overall.totalReviews) * 100) : 0,
          averageRatingText: `${Math.round(overall.averageRating * 10) / 10} out of 5`,
          needsAttention: overall.pendingReviews
        }
      }
    });

  } catch (error) {
    console.error('Superadmin review dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
