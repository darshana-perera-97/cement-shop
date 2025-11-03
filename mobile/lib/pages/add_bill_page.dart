import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/bill.dart';
import '../models/customer.dart';
import '../services/api_service.dart';

class AddBillPage extends StatefulWidget {
  const AddBillPage({super.key});

  @override
  State<AddBillPage> createState() => _AddBillPageState();
}

class _AddBillPageState extends State<AddBillPage> {
  final _formKey = GlobalKey<FormState>();
  final _stockNumberController = TextEditingController();
  final _dateController = TextEditingController();
  final _customerSearchController = TextEditingController();

  List<Customer> _customers = [];
  List<Customer> _filteredCustomers = [];
  bool _showCustomerDropdown = false;
  String? _selectedCustomerId;
  String? _selectedCustomerName;

  List<BillItemInput> _items = [
    BillItemInput(name: 'Tokyo'),
    BillItemInput(name: 'Sanstha'),
    BillItemInput(name: 'Atlas'),
    BillItemInput(name: 'Nipon'),
  ];

  bool _loading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    _fetchCustomers();
    _dateController.text = _getTodayDate();
  }

  @override
  void dispose() {
    _stockNumberController.dispose();
    _dateController.dispose();
    _customerSearchController.dispose();
    for (var item in _items) {
      item.bagsController.dispose();
      item.unitPriceController.dispose();
    }
    super.dispose();
  }

  String _getTodayDate() {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  }

  Future<void> _fetchCustomers() async {
    try {
      final customers = await ApiService.getCustomers();
      setState(() {
        _customers = customers;
      });
    } catch (e) {
      // Silently fail, customer search will handle errors
    }
  }

  void _onCustomerSearchChanged(String value) {
    setState(() {
      _showCustomerDropdown = value.isNotEmpty;
      if (value.isEmpty) {
        _selectedCustomerId = null;
        _selectedCustomerName = null;
      }
      _filteredCustomers = _customers
          .where((customer) =>
              customer.customerName.toLowerCase().contains(value.toLowerCase()) ||
              customer.customerId.toLowerCase().contains(value.toLowerCase()))
          .toList();
    });
  }

  void _selectCustomer(Customer customer) {
    setState(() {
      _selectedCustomerId = customer.customerId;
      _selectedCustomerName = customer.customerName;
      _customerSearchController.text = customer.customerName;
      _showCustomerDropdown = false;
    });
  }

  void _updateItemTotal(int index) {
    setState(() {
      final item = _items[index];
      final bags = double.tryParse(item.bagsController.text) ?? 0;
      final unitPrice = double.tryParse(item.unitPriceController.text) ?? 0;
      item.total = bags * unitPrice;
    });
  }

  double _calculateBillTotal() {
    return _items.fold(0.0, (sum, item) => sum + item.total);
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedCustomerId == null || _selectedCustomerName == null) {
      setState(() {
        _errorMessage = 'Please select a customer';
      });
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final bill = Bill(
        customerId: _selectedCustomerId!,
        customerName: _selectedCustomerName!,
        stockNumber: _stockNumberController.text.trim().isEmpty
            ? null
            : _stockNumberController.text.trim(),
        date: _dateController.text,
        items: _items.map((item) {
          return BillItem(
            name: item.name,
            bags: double.tryParse(item.bagsController.text) ?? 0,
            unitPrice: double.tryParse(item.unitPriceController.text) ?? 0,
            total: item.total,
          );
        }).toList(),
        billTotal: _calculateBillTotal(),
      );

      await ApiService.addBill(bill);

      setState(() {
        _successMessage = 'Bill added successfully!';
        _loading = false;
      });

      // Reset form
      _stockNumberController.clear();
      _dateController.text = _getTodayDate();
      _customerSearchController.clear();
      _selectedCustomerId = null;
      _selectedCustomerName = null;
      for (var item in _items) {
        item.bagsController.clear();
        item.unitPriceController.clear();
        item.total = 0;
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Bill'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Add Bill',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      if (_errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            border: Border.all(color: Colors.red.shade200),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.error_outline, color: Colors.red.shade700),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: TextStyle(color: Colors.red.shade700),
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.close, size: 20, color: Colors.red.shade700),
                                onPressed: () {
                                  setState(() {
                                    _errorMessage = null;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      if (_successMessage != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            border: Border.all(color: Colors.green.shade200),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.check_circle_outline, color: Colors.green.shade700),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _successMessage!,
                                  style: TextStyle(color: Colors.green.shade700),
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.close, size: 20, color: Colors.green.shade700),
                                onPressed: () {
                                  setState(() {
                                    _successMessage = null;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                      // Customer Search
                      Stack(
                        children: [
                          TextFormField(
                            controller: _customerSearchController,
                            decoration: const InputDecoration(
                              labelText: 'Customer Name *',
                              border: OutlineInputBorder(),
                            ),
                            onChanged: _onCustomerSearchChanged,
                            onTap: () {
                              setState(() {
                                _showCustomerDropdown = _customerSearchController.text.isNotEmpty;
                              });
                            },
                            validator: (value) {
                              if (_selectedCustomerId == null) {
                                return 'Please select a customer';
                              }
                              return null;
                            },
                          ),
                          if (_showCustomerDropdown &&
                              _customerSearchController.text.isNotEmpty)
                            Positioned(
                              top: 60,
                              left: 0,
                              right: 0,
                              child: Container(
                                constraints: const BoxConstraints(maxHeight: 200),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  border: Border.all(color: Colors.grey.shade300),
                                  borderRadius: BorderRadius.circular(4),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 4,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: _filteredCustomers.isEmpty
                                    ? const Padding(
                                        padding: EdgeInsets.all(16.0),
                                        child: Text('No customers found'),
                                      )
                                    : ListView.builder(
                                        shrinkWrap: true,
                                        itemCount: _filteredCustomers.length,
                                        itemBuilder: (context, index) {
                                          final customer = _filteredCustomers[index];
                                          return ListTile(
                                            title: Text(
                                                '${customer.customerName} (${customer.customerId})'),
                                            onTap: () => _selectCustomer(customer),
                                          );
                                        },
                                      ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _stockNumberController,
                        decoration: const InputDecoration(
                          labelText: 'Stock Number',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _dateController,
                        decoration: const InputDecoration(
                          labelText: 'Date',
                          border: OutlineInputBorder(),
                          suffixIcon: Icon(Icons.calendar_today),
                        ),
                        readOnly: true,
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: DateTime.now(),
                            firstDate: DateTime(2000),
                            lastDate: DateTime(2100),
                          );
                          if (date != null) {
                            _dateController.text =
                                '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
                          }
                        },
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Cement Type',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildItemsTable(),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _loading ? null : _submitForm,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.deepPurple,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: _loading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor:
                                        AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Text('Save Bill'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItemsTable() {
    return Card(
      child: Table(
        border: TableBorder.all(color: Colors.grey.shade300),
        children: [
          TableRow(
            decoration: BoxDecoration(color: Colors.grey.shade800),
            children: const [
              Padding(
                padding: EdgeInsets.all(12.0),
                child: Text(
                  'Cement Type',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(12.0),
                child: Text(
                  'Bags',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              Padding(
                padding: EdgeInsets.all(12.0),
                child: Text(
                  'Unit Price',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              Padding(
                padding: EdgeInsets.all(12.0),
                child: Text(
                  'Total',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          ..._items.map((item) {
            final index = _items.indexOf(item);
            return TableRow(
              decoration: BoxDecoration(
                color: index % 2 == 0 ? Colors.white : Colors.grey.shade50,
              ),
              children: [
                Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text(item.name),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: item.bagsController,
                    keyboardType: TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: '0',
                      contentPadding: EdgeInsets.all(8),
                    ),
                    textAlign: TextAlign.center,
                    onChanged: (_) => _updateItemTotal(index),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextFormField(
                    controller: item.unitPriceController,
                    keyboardType: TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: '0',
                      contentPadding: EdgeInsets.all(8),
                    ),
                    textAlign: TextAlign.center,
                    onChanged: (_) => _updateItemTotal(index),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text(
                    item.total.toStringAsFixed(2),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            );
          }).toList(),
          TableRow(
            children: [
              const Padding(
                padding: EdgeInsets.all(12.0),
                child: Text(
                  'Bill Total:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.right,
                ),
              ),
              const SizedBox(),
              const SizedBox(),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(
                  _calculateBillTotal().toStringAsFixed(2),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class BillItemInput {
  final String name;
  final TextEditingController bagsController = TextEditingController();
  final TextEditingController unitPriceController = TextEditingController();
  double total = 0;

  BillItemInput({required this.name});
}

