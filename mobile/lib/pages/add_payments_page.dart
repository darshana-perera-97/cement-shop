import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/payment.dart';
import '../models/customer.dart';
import '../services/api_service.dart';

class AddPaymentsPage extends StatefulWidget {
  const AddPaymentsPage({super.key});

  @override
  State<AddPaymentsPage> createState() => _AddPaymentsPageState();
}

class _AddPaymentsPageState extends State<AddPaymentsPage> {
  final _formKey = GlobalKey<FormState>();
  final _customerSearchController = TextEditingController();
  final _amountController = TextEditingController();
  final _dateController = TextEditingController();
  final _notesController = TextEditingController();

  List<Customer> _customers = [];
  List<Customer> _filteredCustomers = [];
  bool _showCustomerDropdown = false;
  String? _selectedCustomerId;
  String? _selectedCustomerName;

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
    _customerSearchController.dispose();
    _amountController.dispose();
    _dateController.dispose();
    _notesController.dispose();
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
    });
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
      final payment = Payment(
        customerId: _selectedCustomerId!,
        customerName: _selectedCustomerName!,
        amount: double.tryParse(_amountController.text) ?? 0,
        date: _dateController.text,
        notes: _notesController.text.trim().isEmpty
            ? null
            : _notesController.text.trim(),
      );

      await ApiService.addPayment(payment);

      setState(() {
        _successMessage = 'Payment added successfully!';
        _loading = false;
      });

      // Reset form
      _customerSearchController.clear();
      _amountController.clear();
      _dateController.text = _getTodayDate();
      _notesController.clear();
      _selectedCustomerId = null;
      _selectedCustomerName = null;
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
        title: const Text('Add Payments'),
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
                'Add Payments',
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
                      Stack(
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
                                            subtitle: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  customer.customerId,
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: Colors.black54,
                                                  ),
                                                ),
                                                if (customer.location != null &&
                                                    customer.location!.isNotEmpty)
                                                  Text(
                                                    customer.location!,
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      color: Colors.black54,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            dense: true,
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
                        controller: _amountController,
                        decoration: const InputDecoration(
                          labelText: 'Amount *',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.numberWithOptions(decimal: true),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter payment amount';
                          }
                          if (double.tryParse(value) == null) {
                            return 'Please enter a valid amount';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _dateController,
                        decoration: const InputDecoration(
                          labelText: 'Date *',
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
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please select a date';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _notesController,
                        decoration: const InputDecoration(
                          labelText: 'Notes',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 3,
                      ),
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
                              : const Text('Save Payment'),
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
}

