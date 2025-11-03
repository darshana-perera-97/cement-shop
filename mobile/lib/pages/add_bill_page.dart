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
      if (value.isEmpty) {
        _selectedCustomerId = null;
        _selectedCustomerName = null;
        // Show all customers when field is empty
        _filteredCustomers = _customers;
        _showCustomerDropdown = false; // Hide on empty, show on focus
      } else {
        _filteredCustomers = _customers
            .where((customer) =>
                customer.customerName.toLowerCase().contains(value.toLowerCase()) ||
                customer.customerId.toLowerCase().contains(value.toLowerCase()) ||
                (customer.location != null && 
                 customer.location!.toLowerCase().contains(value.toLowerCase())))
            .toList();
        _showCustomerDropdown = true;
      }
    });
  }

  void _toggleCustomerDropdown() {
    setState(() {
      if (_customerSearchController.text.isEmpty) {
        // Show all customers when dropdown is toggled
        _filteredCustomers = _customers;
      }
      _showCustomerDropdown = !_showCustomerDropdown;
    });
  }

  void _selectCustomer(Customer customer) {
    setState(() {
      _selectedCustomerId = customer.customerId;
      _selectedCustomerName = customer.customerName;
      _customerSearchController.text = customer.customerName;
      _showCustomerDropdown = false;
      // Clear any error messages when customer is selected
      _errorMessage = null;
    });
    // Trigger form validation update
    _formKey.currentState?.validate();
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: GestureDetector(
        onTap: () {
          // Close dropdown when tapping outside
          if (_showCustomerDropdown) {
            setState(() {
              _showCustomerDropdown = false;
            });
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              const Text(
                'Add Bill',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 32),
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
                            color: Colors.grey.shade50,
                            border: Border.all(color: Colors.black.withOpacity(0.2)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.error_outline, color: Colors.black, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _errorMessage!,
                                  style: const TextStyle(color: Colors.black87, fontSize: 14),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, size: 18, color: Colors.black54),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
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
                            color: Colors.grey.shade50,
                            border: Border.all(color: Colors.black.withOpacity(0.2)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.check_circle_outline, color: Colors.black, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _successMessage!,
                                  style: const TextStyle(color: Colors.black87, fontSize: 14),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close, size: 18, color: Colors.black54),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
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
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextFormField(
                            controller: _customerSearchController,
                            decoration: InputDecoration(
                              labelText: 'Customer Name *',
                              border: const OutlineInputBorder(),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _showCustomerDropdown ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                  color: Colors.black54,
                                ),
                                onPressed: _toggleCustomerDropdown,
                              ),
                            ),
                            onChanged: _onCustomerSearchChanged,
                            onTap: () {
                              setState(() {
                                if (_customerSearchController.text.isEmpty) {
                                  _filteredCustomers = _customers;
                                }
                                _showCustomerDropdown = true;
                              });
                            },
                            validator: (value) {
                              if (_selectedCustomerId == null) {
                                return 'Please select a customer';
                              }
                              return null;
                            },
                          ),
                          if (_showCustomerDropdown)
                            Container(
                              margin: const EdgeInsets.only(top: 4),
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
                                      child: Text(
                                        'No customers found',
                                        style: TextStyle(color: Colors.black87),
                                      ),
                                    )
                                  : ListView.builder(
                                      shrinkWrap: true,
                                      itemCount: _filteredCustomers.length,
                                      itemBuilder: (context, index) {
                                        final customer = _filteredCustomers[index];
                                        return ListTile(
                                          title: Text(
                                            customer.customerName,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          subtitle: customer.location != null &&
                                                  customer.location!.isNotEmpty
                                              ? Text(
                                                  customer.location!,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.black54,
                                                  ),
                                                )
                                              : null,
                                          dense: true,
                                          onTap: () => _selectCustomer(customer),
                                        );
                                      },
                                    ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _stockNumberController,
                        decoration: const InputDecoration(
                          labelText: 'Stock Number',
                          labelStyle: TextStyle(color: Colors.black54),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 20),
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
      ),
    );
  }

  Widget _buildItemsTable() {
    return Card(
      child: Table(
        border: TableBorder.all(color: Colors.grey.shade300),
        children: [
          TableRow(
            decoration: BoxDecoration(color: Colors.black),
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

