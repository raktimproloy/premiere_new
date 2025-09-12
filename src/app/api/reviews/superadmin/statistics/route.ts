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

    // Only superadmin can view review statistics
    if (result.user.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Only superadmin can view review statistics.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const property_id = searchParams.get('property_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    const client = await clientPromise;
    const db = client.db("premiere-stays");

    // Build filter query
    const filter: any = {};
    
    if (property_id) {
      filter.property_id = parseInt(property_id);
    }
    
    if (date_from && date_to) {
      filter.created_at = {
        $gte: new Date(date_from),
        $lte: new Date(date_to)
      };
    }

    // Get overall statistics
    const overallStats = await db.collection("reviews").aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$stars' },
          statusCounts: {
            $push: '$status'
          },
          ratingDistribution: {
            $push: '$stars'
          },
          recentReviews: {
            $push: {
              id: '$_id',
              display_name: '$display_name',
              stars: '$stars',
              status: '$status',
              created_at: '$created_at',
              property_name: '$property.name'
            }
          }
        }
      }
    ]).toArray();

    // Get status breakdown
    const statusBreakdown = await db.collection("reviews").aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get rating distribution
    const ratingDistribution = await db.collection("reviews").aggregate([
      { $match: { ...filter, status: 'approved' } },
      {
        $group: {
          _id: '$stars',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]).toArray();

    // Get property-wise statistics
    const propertyStats = await db.collection("reviews").aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$property_id',
          property_name: { $first: '$property.name' },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$stars' },
          approvedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejectedReviews: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalReviews: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Get monthly review trends
    const monthlyTrends = await db.collection("reviews").aggregate([
      { $match: filter },
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
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]).toArray();

    // Process overall statistics
    let totalReviews = 0;
    let averageRating = 0;
        const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let recentReviews = [];

    if (overallStats.length > 0) {
      const stats = overallStats[0];
      totalReviews = stats.totalReviews;
      averageRating = Math.round(stats.averageRating * 10) / 10;
      
      // Process status counts
      stats.statusCounts.forEach((status: string) => {
        statusCounts[status as keyof typeof statusCounts]++;
      });
      
      // Process rating distribution
      stats.ratingDistribution.forEach((rating: number) => {
        if (rating >= 5) ratingDist[5]++;
        else if (rating >= 4) ratingDist[4]++;
        else if (rating >= 3) ratingDist[3]++;
        else if (rating >= 2) ratingDist[2]++;
        else ratingDist[1]++;
      });
      
      // Get recent reviews (last 5)
      recentReviews = stats.recentReviews
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
    }

    // Process status breakdown
    const statusBreakdownFormatted = statusBreakdown.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Process rating distribution
    const ratingDistributionFormatted = ratingDistribution.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Process monthly trends
    const monthlyTrendsFormatted = monthlyTrends.map((trend: any) => ({
      month: trend._id.month,
      year: trend._id.year,
      count: trend.count,
      averageRating: Math.round(trend.averageRating * 10) / 10,
      approvedCount: trend.approvedCount
    }));

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          totalReviews,
          averageRating,
          averageRatingText: `${averageRating} out of 5`,
          statusCounts,
          ratingDistribution: ratingDist
        },
        statusBreakdown: statusBreakdownFormatted,
        ratingDistribution: ratingDistributionFormatted,
        propertyStats: propertyStats.map(stat => ({
          property_id: stat._id,
          property_name: stat.property_name,
          totalReviews: stat.totalReviews,
          averageRating: Math.round(stat.averageRating * 10) / 10,
          approvedReviews: stat.approvedReviews,
          pendingReviews: stat.pendingReviews,
          rejectedReviews: stat.rejectedReviews
        })),
        monthlyTrends: monthlyTrendsFormatted,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Superadmin review statistics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
