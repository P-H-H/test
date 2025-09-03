import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Receipt,
  X,
  ShoppingCart,
  Calculator,
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const POS = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(5); // 5% tax rate
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Mock products data
  const [products] = useState([
    {
      id: 1,
      name: 'Jasmine Rice',
      nameMyanmar: 'ဆန်ထမင်း',
      barcode: '1234567890123',
      price: 2500,
      currency: 'MMK',
      category: 'grains',
      stock: 150,
      unit: 'kg',
      image: null
    },
    {
      id: 2,
      name: 'Cooking Oil',
      nameMyanmar: 'ဆီ',
      barcode: '1234567890124',
      price: 3500,
      currency: 'MMK',
      category: 'cooking_essentials',
      stock: 80,
      unit: 'L',
      image: null
    },
    {
      id: 3,
      name: 'Fresh Tomatoes',
      nameMyanmar: 'ချဉ်ချဉ်သီး',
      barcode: '1234567890125',
      price: 800,
      currency: 'MMK',
      category: 'vegetables',
      stock: 45,
      unit: 'kg',
      image: null
    },
    {
      id: 4,
      name: 'Instant Noodles',
      nameMyanmar: 'ခေါက်ဆွဲခြောက်',
      barcode: '1234567890126',
      price: 1200,
      currency: 'MMK',
      category: 'snacks',
      stock: 200,
      unit: 'pack',
      image: null
    },
    {
      id: 5,
      name: 'Tea Leaf',
      nameMyanmar: 'လက်ဖက်ခြောက်',
      barcode: '1234567890127',
      price: 1800,
      currency: 'MMK',
      category: 'beverages',
      stock: 120,
      unit: 'kg',
      image: null
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Categories', nameMyanmar: 'အားလုံး' },
    { id: 'grains', name: 'Grains & Cereals', nameMyanmar: 'ဆန်နှင့်ကောက်နှံ' },
    { id: 'vegetables', name: 'Fresh Vegetables', nameMyanmar: 'ဟင်းသီးဟင်းရွက်လတ်လတ်' },
    { id: 'fruits', name: 'Fresh Fruits', nameMyanmar: 'သစ်သီးလတ်လတ်' },
    { id: 'meat', name: 'Fresh Meat', nameMyanmar: 'အသားလတ်လတ်' },
    { id: 'dairy', name: 'Dairy & Eggs', nameMyanmar: 'နို့ထွက်ပစ္စည်းနှင့်ဥများ' },
    { id: 'beverages', name: 'Beverages', nameMyanmar: 'သောက်စရာများ' },
    { id: 'snacks', name: 'Snacks & Chips', nameMyanmar: 'အစာစားစရာနှင့်ချစ်ပါ' },
    { id: 'cooking_essentials', name: 'Cooking Essentials', nameMyanmar: 'ချက်ပြုတ်ရန်လိုအပ်သောပစ္စည်းများ' }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.nameMyanmar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '', address: '' });
    setDiscount(0);
    toast.success('Cart cleared');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * tax) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - discount;
  };

  const processPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (calculateTotal() <= 0) {
      toast.error('Invalid total amount');
      return;
    }

    // Simulate payment processing
    toast.loading('Processing payment...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Payment processed successfully!');
      
      // Generate receipt
      const receipt = {
        id: `REC-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart,
        subtotal: calculateSubtotal(),
        tax: calculateTaxAmount(),
        discount: discount,
        total: calculateTotal(),
        customer: customerInfo,
        paymentMethod: paymentMethod
      };
      
      console.log('Receipt:', receipt);
      
      // Clear cart and reset
      clearCart();
    }, 2000);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryNameMyanmar = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nameMyanmar : '';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
              <p className="text-gray-600">Scan products or search to add to cart</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Store</p>
                <p className="font-medium text-gray-900">Yangon Central Store</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Cashier</p>
                <p className="font-medium text-gray-900">U Aung Kyaw</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products by name, Myanmar name, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} / {category.nameMyanmar}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <div className="text-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                  {product.nameMyanmar && (
                    <p className="text-gray-600 text-xs mb-2">{product.nameMyanmar}</p>
                  )}
                  <p className="text-lg font-bold text-primary-600 mb-1">
                    {product.price.toLocaleString()} {product.currency}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Stock: {product.stock} {product.unit}
                  </p>
                  <p className="text-xs text-gray-400">{product.barcode}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cart is empty</h3>
              <p className="text-gray-600">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      {item.nameMyanmar && (
                        <p className="text-gray-600 text-xs">{item.nameMyanmar}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {item.price.toLocaleString()} {item.currency} × {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()} {item.currency}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.id);
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Customer Information</h3>
            <button
              onClick={() => setShowCustomerForm(!showCustomerForm)}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              {showCustomerForm ? 'Hide' : 'Add'}
            </button>
          </div>
          
          {showCustomerForm && (
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{calculateSubtotal().toLocaleString()} MMK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({tax}%):</span>
              <span className="font-medium">{calculateTaxAmount().toLocaleString()} MMK</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium">-{discount.toLocaleString()} MMK</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary-600">{calculateTotal().toLocaleString()} MMK</span>
              </div>
            </div>
          </div>

          {/* Discount Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (MMK)</label>
            <input
              type="number"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Payment Method */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Credit/Debit Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Process Payment Button */}
          <button
            onClick={processPayment}
            disabled={cart.length === 0}
            className="w-full mt-4 bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              Process Payment
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;