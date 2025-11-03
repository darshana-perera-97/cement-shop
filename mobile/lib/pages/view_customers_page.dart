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
  List<Customer> _filteredCustomers = [];
  bool _loading = true;
  String? _errorMessage;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCustomers();
    _searchController.addListener(_filterCustomers);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterCustomers() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      if (query.isEmpty) {
        _filteredCustomers = _customers;
      } else {
        _filteredCustomers = _customers.where((customer) {
          final name = customer.customerName.toLowerCase();
          final location = (customer.location ?? '').toLowerCase();
          final customerId = customer.customerId.toLowerCase();
          return name.contains(query) ||
              location.contains(query) ||
              customerId.contains(query);
        }).toList();
      }
    });
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
        _filteredCustomers = customers;
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
                        Icon(Icons.error_outline, size: 48, color: Colors.black54),
                        const SizedBox(height: 16),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.black87),
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
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.info_outline, size: 48, color: Colors.black54),
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
                        padding: const EdgeInsets.all(20.0),
                        children: [
                          const Text(
                            'View Customers',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w700,
                              color: Colors.black,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 24),
                          // Search Field
                          Card(
                            child: TextField(
                              controller: _searchController,
                              decoration: InputDecoration(
                                hintText: 'Search by name, location, or ID',
                                hintStyle: const TextStyle(color: Colors.black54),
                                prefixIcon: const Icon(Icons.search, color: Colors.black54),
                                suffixIcon: _searchController.text.isNotEmpty
                                    ? IconButton(
                                        icon: const Icon(Icons.clear, color: Colors.black54),
                                        onPressed: () {
                                          _searchController.clear();
                                        },
                                      )
                                    : const SizedBox.shrink(),
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 16,
                                ),
                              ),
                              style: const TextStyle(color: Colors.black),
                              onChanged: (value) {
                                setState(() {}); // Rebuild to update suffixIcon
                              },
                            ),
                          ),
                          const SizedBox(height: 20),
                          // Results count
                          if (_searchController.text.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12.0),
                              child: Text(
                                '${_filteredCustomers.length} customer${_filteredCustomers.length != 1 ? 's' : ''} found',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.black54,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          // Customer Table
                          _filteredCustomers.isEmpty
                              ? Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(32.0),
                                    child: Center(
                                      child: Column(
                                        children: [
                                          Icon(Icons.search_off, size: 48, color: Colors.black54),
                                          const SizedBox(height: 16),
                                          const Text(
                                            'No customers match your search',
                                            style: TextStyle(
                                              fontSize: 16,
                                              color: Colors.black87,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                )
                              : Card(
                                  child: Column(
                                    children: [
                                      Table(
                                        border: TableBorder.all(color: Colors.grey.shade300),
                                        children: [
                                          TableRow(
                                            decoration: BoxDecoration(
                                              color: Colors.black,
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
                                          ..._filteredCustomers.map((customer) {
                                            return TableRow(
                                              decoration: BoxDecoration(
                                                color: _filteredCustomers.indexOf(customer) % 2 == 0
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
                                                  child: Text(
                                                    customer.customerName,
                                                    style: const TextStyle(
                                                      fontWeight: FontWeight.w500,
                                                    ),
                                                  ),
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

