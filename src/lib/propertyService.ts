import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import { LocalProperty, PropertyCreateRequest, PropertyUpdateRequest } from './propertySchema';

export const propertyService = {
  async createProperty(propertyData: PropertyCreateRequest): Promise<{ success: boolean; property?: LocalProperty; error?: string }> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      // Check if property with this OwnerRez ID already exists
      const existingProperty = await db.collection("properties").findOne({
        ownerRezId: propertyData.ownerRezId
      });

      if (existingProperty) {
        return {
          success: false,
          error: "Property with this OwnerRez ID already exists"
        };
      }

      const newProperty: LocalProperty = {
        ...propertyData,
        images: [],
        amenities: [],
        rules: [],
        status: 'draft',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncedWithOwnerRez: new Date()
      };

      const result = await db.collection("properties").insertOne(newProperty);
      const createdProperty = { ...newProperty, _id: result.insertedId };

      return {
        success: true,
        property: createdProperty
      };
    } catch (error) {
      console.error("Create property error:", error);
      return {
        success: false,
        error: "Failed to create property"
      };
    }
  },

  async getPropertyById(id: string): Promise<LocalProperty | null> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const property = await db.collection("properties").findOne({
        _id: new ObjectId(id)
      });

      return property as LocalProperty | null;
    } catch (error) {
      console.error("Get property by ID error:", error);
      return null;
    }
  },

  async getPropertyByOwnerRezId(ownerRezId: number): Promise<LocalProperty | null> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const property = await db.collection("properties").findOne({
        ownerRezId: ownerRezId
      });

      return property as LocalProperty | null;
    } catch (error) {
      console.error("Get property by OwnerRez ID error:", error);
      return null;
    }
  },

  async getAllProperties(): Promise<LocalProperty[]> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const properties = await db.collection("properties")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return properties as LocalProperty[];
    } catch (error) {
      console.error("Get all properties error:", error);
      return [];
    }
  },

  async updateProperty(id: string, updateData: PropertyUpdateRequest): Promise<{ success: boolean; property?: LocalProperty; error?: string }> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const updateResult = await db.collection("properties").updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      );

      if (updateResult.matchedCount === 0) {
        return {
          success: false,
          error: "Property not found"
        };
      }

      const updatedProperty = await this.getPropertyById(id);
      return {
        success: true,
        property: updatedProperty || undefined
      };
    } catch (error) {
      console.error("Update property error:", error);
      return {
        success: false,
        error: "Failed to update property"
      };
    }
  },

  async deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const deleteResult = await db.collection("properties").deleteOne({
        _id: new ObjectId(id)
      });

      if (deleteResult.deletedCount === 0) {
        return {
          success: false,
          error: "Property not found"
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error("Delete property error:", error);
      return {
        success: false,
        error: "Failed to delete property"
      };
    }
  },

  async searchProperties(query: string): Promise<LocalProperty[]> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const properties = await db.collection("properties")
        .find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { 'address.city': { $regex: query, $options: 'i' } },
            { 'address.state': { $regex: query, $options: 'i' } },
            { 'address.country': { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();

      return properties as LocalProperty[];
    } catch (error) {
      console.error("Search properties error:", error);
      return [];
    }
  },

  async getPropertiesByStatus(status: string): Promise<LocalProperty[]> {
    try {
      const client = await clientPromise;
      const db = client.db("premiere-stays");

      const properties = await db.collection("properties")
        .find({ status })
        .sort({ createdAt: -1 })
        .toArray();

      return properties as LocalProperty[];
    } catch (error) {
      console.error("Get properties by status error:", error);
      return [];
    }
  }
};
