import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Smartphone,
  Receipt,
  X,
  Scan,
  Calculator,
  Package
} from 'lucide-react';

const POS = () => {
  const { storeId } = useParams();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcode, setBarcode] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const queryClient = useQueryClient();

  // Fetch store info
  const { data: store } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const response = await axios.get(`/api/stores/${storeId}`);
      return response.data;
    },
  });

  // Fetch inventory for this store
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['pos-inventory', storeId, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '50');
      
      const response = await axios.get(`/api/inventory/${storeId}?${params}`);
      return response.data;
    },
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (saleData) => {
      const response = await axios.post('/api/sales', saleData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['pos-inventory', storeId]);
      queryClient.invalidateQueries(['inventory', storeId]);
      toast.success('Sale completed successfully!');
      setLastSale(data);
      setIsCheckoutModalOpen(false);
      setIsReceiptModalOpen(true);
      clearCart();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    },
  });

  // Search product by barcode
  const searchByBarcode = async (barcodeValue) => {
    try {
      const response = await axios.get(`/api/products/barcode/${barcodeValue}`);
      const product = response.data;
      
      // Find the product in inventory
      const inventoryItem = inventory.find(item => item.product._id === product._id);
      if (inventoryItem && inventoryItem.quantity > 0) {
        addToCart(inventoryItem);
        setBarcode('');
        toast.success(`${product.name} added to cart`);
      } else {
        toast.error('Product not available in inventory');
      }
    } catch (error) {
      toast.error('Product not found');
    }
  };

  const addToCart = (inventoryItem) => {
    const existingItem = cart.find(item => item.product._id === inventoryItem.product._id);
    
    if (existingItem) {
      if (existingItem.quantity >= inventoryItem.quantity) {
        toast.error('Not enough stock available');
        return;
      }
      updateCartItemQuantity(inventoryItem.product._id, existingItem.quantity + 1);
    } else {
      const cartItem = {
        product: inventoryItem.product,
        quantity: 1,
        unitPrice: inventoryItem.product.sellingPrice,
        totalPrice: inventoryItem.product.sellingPrice,
        availableStock: inventoryItem.quantity
      };
      setCart(prev => [...prev, cartItem]);
    }
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        if (newQuantity > item.availableStock) {
          toast.error('Not enough stock available');
          return item;
        }
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerInfo({ name: '', phone: '', email: '' });
    setTax(0);
    setDiscount(0);
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + tax - discount;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const completeSale = () => {
    const saleData = {
      storeId,
      items: cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      })),
      subtotal: calculateSubtotal(),
      tax,
      discount,
      totalAmount: calculateTotal(),
      paymentMethod,
      customerInfo: customerInfo.name ? customerInfo : undefined
    };

    createSaleMutation.mutate(saleData);
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (barcode.trim()) {
      searchByBarcode(barcode.trim());
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'b':
            e.preventDefault();
            barcodeInputRef.current?.focus();
            break;
          case 'Enter':
            e.preventDefault();
            if (cart.length > 0) {
              handleCheckout();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart]);

  const inventory = inventoryData?.inventory || [];
  const availableProducts = inventory.filter(item => item.quantity > 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex overflow-hidden bg-gray-100">
        {/* Left Panel - Products */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
                <p className="text-sm text-gray-500">{store?.name}</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Ctrl+F: Search</span>
                <span>•</span>
                <span>Ctrl+B: Barcode</span>
                <span>•</span>
                <span>Ctrl+Enter: Checkout</span>
              </div>
            </div>
          </div>

          {/* Search and Barcode */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products... (Ctrl+F)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <form onSubmit={handleBarcodeSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Scan className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan or enter barcode... (Ctrl+B)"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </form>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {availableProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableProducts.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => addToCart(item)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500">{item.product.category}</p>
                        <p className="text-xs text-gray-500">Stock: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ${item.product.sellingPrice}
                        </p>
                        <p className="text-xs text-gray-500">{item.product.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products available</h3>
                <p className="mt-1 text-sm text-gray-500">Check inventory or search for products.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">{cart.length} items</span>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">${item.unitPrice} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.product._id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.product._id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-1 rounded-full hover:bg-red-100 ml-2"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Add products to start a sale</p>
              </div>
            )}
          </div>

          {/* Cart Summary and Actions */}
          {cart.length > 0 && (
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={createSaleMutation.isLoading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {createSaleMutation.isLoading ? 'Processing...' : 'Checkout (Ctrl+Enter)'}
                </button>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsCheckoutModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Complete Sale
                      </h3>
                      <button
                        onClick={() => setIsCheckoutModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex items-center justify-center p-3 border rounded-md ${
                              paymentMethod === 'cash' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                            }`}
                          >
                            <DollarSign className="h-5 w-5 mr-2" />
                            Cash
                          </button>
                          <button
                            onClick={() => setPaymentMethod('card')}
                            className={`flex items-center justify-center p-3 border rounded-md ${
                              paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                            }`}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            Card
                          </button>
                          <button
                            onClick={() => setPaymentMethod('mobile_payment')}
                            className={`flex items-center justify-center p-3 border rounded-md ${
                              paymentMethod === 'mobile_payment' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                            }`}
                          >
                            <Smartphone className="h-5 w-5 mr-2" />
                            Mobile
                          </button>
                          <button
                            onClick={() => setPaymentMethod('credit')}
                            className={`flex items-center justify-center p-3 border rounded-md ${
                              paymentMethod === 'credit' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                            }`}
                          >
                            <Receipt className="h-5 w-5 mr-2" />
                            Credit
                          </button>
                        </div>
                      </div>

                      {/* Tax and Discount */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tax ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tax}
                            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Discount ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Customer Info (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Information (Optional)</label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Customer name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          {tax > 0 && (
                            <div className="flex justify-between">
                              <span>Tax:</span>
                              <span>${tax.toFixed(2)}</span>
                            </div>
                          )}
                          {discount > 0 && (
                            <div className="flex justify-between">
                              <span>Discount:</span>
                              <span>-${discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={completeSale}
                  disabled={createSaleMutation.isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {createSaleMutation.isLoading ? 'Processing...' : 'Complete Sale'}
                </button>
                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptModalOpen && lastSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsReceiptModalOpen(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <Receipt className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Sale Completed!
                  </h3>

                  {/* Receipt */}
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="text-center mb-4">
                      <h4 className="font-bold">{store?.name}</h4>
                      <p className="text-xs text-gray-600">{store?.address?.street}</p>
                      <p className="text-xs text-gray-600">{store?.phone}</p>
                      <p className="text-xs text-gray-600 mt-2">Receipt: {lastSale.receiptNumber}</p>
                      <p className="text-xs text-gray-600">{new Date(lastSale.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="border-t border-gray-300 pt-2 mb-2">
                      {lastSale.items?.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.product?.name} x{item.quantity}</span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-300 pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${lastSale.subtotal.toFixed(2)}</span>
                      </div>
                      {lastSale.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>${lastSale.tax.toFixed(2)}</span>
                        </div>
                      )}
                      {lastSale.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Discount:</span>
                          <span>-${lastSale.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Total:</span>
                        <span>${lastSale.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payment:</span>
                        <span className="capitalize">{lastSale.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div className="text-center mt-4 text-xs text-gray-600">
                      <p>Thank you for your business!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default POS;