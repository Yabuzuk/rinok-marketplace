import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  category: String,
  image: String,
  description: String,
  sellerId: String,
  pavilionNumber: String,
  stock: Number,
  rating: Number,
  reviews: Number,
  minOrderQuantity: Number,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: String,
  customerId: String,
  items: Array,
  total: Number,
  status: String,
  deliveryAddress: String,
  pavilionNumber: String,
  createdAt: { type: Date, default: Date.now }
});

const deliverySchema = new mongoose.Schema({
  id: String,
  orderId: String,
  status: String,
  pickupAddress: String,
  deliveryAddress: String,
  estimatedTime: String,
  deliveryFee: Number,
  customerPhone: String,
  courierId: String,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  role: String,
  type: String,
  avatar: String,
  inn: String,
  pavilionNumber: String,
  blocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);
const Delivery = mongoose.model('Delivery', deliverySchema);

class MongoDB {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(this.connectionString);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  async save(collection, data) {
    try {
      let Model;
      switch (collection) {
        case 'products':
          Model = Product;
          break;
        case 'orders':
          Model = Order;
          break;
        case 'users':
          Model = User;
          break;
        case 'deliveries':
          Model = Delivery;
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }

      const doc = new Model(data);
      await doc.save();
      console.log(`Saved ${collection}:`, data.id);
      return data.id;
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);
      throw error;
    }
  }

  async getAll(collection) {
    try {
      let Model;
      switch (collection) {
        case 'products':
          Model = Product;
          break;
        case 'orders':
          Model = Order;
          break;
        case 'users':
          Model = User;
          break;
        case 'deliveries':
          Model = Delivery;
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }

      const docs = await Model.find({}).sort({ createdAt: -1 });
      console.log(`Retrieved ${collection}:`, docs.length);
      return docs.map(doc => doc.toObject());
    } catch (error) {
      console.error(`Error getting ${collection}:`, error);
      return [];
    }
  }

  async update(collection, id, data) {
    try {
      let Model;
      switch (collection) {
        case 'products':
          Model = Product;
          break;
        case 'orders':
          Model = Order;
          break;
        case 'users':
          Model = User;
          break;
        case 'deliveries':
          Model = Delivery;
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }

      await Model.findOneAndUpdate({ id }, data);
      return true;
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      return false;
    }
  }

  async delete(collection, id) {
    try {
      let Model;
      switch (collection) {
        case 'products':
          Model = Product;
          break;
        case 'orders':
          Model = Order;
          break;
        case 'users':
          Model = User;
          break;
        case 'deliveries':
          Model = Delivery;
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }

      await Model.findOneAndDelete({ id });
      return true;
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      return false;
    }
  }

  async clearAll(collection) {
    try {
      let Model;
      switch (collection) {
        case 'products':
          Model = Product;
          break;
        case 'orders':
          Model = Order;
          break;
        case 'users':
          Model = User;
          break;
        case 'deliveries':
          Model = Delivery;
          break;
        default:
          throw new Error(`Unknown collection: ${collection}`);
      }

      await Model.deleteMany({});
      console.log(`Cleared all ${collection}`);
      return true;
    } catch (error) {
      console.error(`Error clearing ${collection}:`, error);
      return false;
    }
  }
}

export default MongoDB;