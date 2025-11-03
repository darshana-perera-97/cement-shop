import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/customer.dart';
import '../services/api_service.dart';

class ViewCustomersPage extends StatefulWidget {
  const ViewCustomersPage({super.key});

  @override
  State<ViewCustomersPage> createState() => _ViewCustomersPageState();
}

class _ViewCustomersPageState extends State<ViewCustomersPage> {
  List<Customer> _customers = [];
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchCustomers();
  }

  Future<void> _fetchCustomers() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final customers = await ApiService.getCustomers();
      setState(() {
        _customers = customers;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error connecting to server. Please make sure the backend server is running.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('View Customers'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 48, color: Colors.red.shade300),
                        const SizedBox(height: 16),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.red.shade700),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchCustomers,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _customers.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.info_outline, size: 48, color: Colors.blue.shade300),
                            const SizedBox(height: 16),
                            const Text(
                              'No customers found.',
                              style: TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchCustomers,
                      child: ListView(
                        padding: const EdgeInsets.all(16.0),
                        children: [
                          const Text(
                            'View Customers',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Card(
                            child: Column(
                              children: [
                                Table(
                                  border: TableBorder.all(color: Colors.grey.shade300),
                                  children: [
                                    TableRow(
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade800,
                                      ),
                                      children: const [
                                        Padding(
                                          padding: EdgeInsets.all(12.0),
                                          child: Text(
                                            'Customer ID',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Padding(
                                          padding: EdgeInsets.all(12.0),
                                          child: Text(
                                            'Customer Name',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Padding(
                                          padding: EdgeInsets.all(12.0),
                                          child: Text(
                                            'Action',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ],
                                    ),
                                    ..._customers.map((customer) {
                                      return TableRow(
                                        decoration: BoxDecoration(
                                          color: _customers.indexOf(customer) % 2 == 0
                                              ? Colors.white
                                              : Colors.grey.shade50,
                                        ),
                                        children: [
                                          Padding(
                                            padding: const EdgeInsets.all(12.0),
                                            child: Text(customer.customerId),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(12.0),
                                            child: Text(customer.customerName),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(12.0),
                                            child: Center(
                                              child: OutlinedButton(
                                                onPressed: () {
                                                  context.go('/customer/${customer.customerId}');
                                                },
                                                style: OutlinedButton.styleFrom(
                                                  foregroundColor: Colors.black,
                                                  side: const BorderSide(color: Colors.black),
                                                ),
                                                child: const Text('View'),
                                              ),
                                            ),
                                          ),
                                        ],
                                      );
                                    }).toList(),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
    );
  }
}

