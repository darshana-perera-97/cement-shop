import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../models/bill.dart';
import '../services/api_service.dart';

class ViewBillsPage extends StatefulWidget {
  const ViewBillsPage({super.key});

  @override
  State<ViewBillsPage> createState() => _ViewBillsPageState();
}

class _ViewBillsPageState extends State<ViewBillsPage> {
  List<Bill> _bills = [];
  List<Bill> _filteredBills = [];
  bool _loading = true;
  String? _errorMessage;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchBills();
    _searchController.addListener(_filterBills);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterBills() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      if (query.isEmpty) {
        _filteredBills = _bills;
      } else {
        _filteredBills = _bills.where((bill) {
          final customerName = bill.customerName.toLowerCase();
          final stockNumber = (bill.stockNumber ?? '').toLowerCase();
          final formattedDate = _formatDate(bill.date).toLowerCase();
          final dateString = bill.date.toLowerCase();
          
          return customerName.contains(query) ||
              stockNumber.contains(query) ||
              formattedDate.contains(query) ||
              dateString.contains(query);
        }).toList();
      }
    });
  }

  Future<void> _fetchBills() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

      try {
      final bills = await ApiService.getBills();
      setState(() {
        _bills = bills;
        _filteredBills = bills;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error connecting to server. Please make sure the backend server is running.';
        _loading = false;
      });
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('MM/dd/yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }

  void _viewBillDetails(Bill bill) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return _BillDetailModal(
          bill: bill,
          onClose: () {
            Navigator.of(context).pop();
          },
          formatDate: _formatDate,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
          appBar: AppBar(
            title: const Text('View Bills'),
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
                              onPressed: _fetchBills,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : _bills.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.info_outline, size: 48, color: Colors.black54),
                                const SizedBox(height: 16),
                                const Text(
                                  'No bills found.',
                                  style: TextStyle(fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchBills,
                          child: ListView(
                            padding: const EdgeInsets.all(20.0),
                            children: [
                              const Text(
                                'View Bills',
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
                                    hintText: 'Search by customer name, stock number, or date',
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
                                    '${_filteredBills.length} bill${_filteredBills.length != 1 ? 's' : ''} found',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: Colors.black54,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              // Bills Table
                              _filteredBills.isEmpty
                                  ? Card(
                                      child: Padding(
                                        padding: const EdgeInsets.all(32.0),
                                        child: Center(
                                          child: Column(
                                            children: [
                                              Icon(Icons.search_off, size: 48, color: Colors.black54),
                                              const SizedBox(height: 16),
                                              const Text(
                                                'No bills match your search',
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
                                                      'Date',
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
                                                      'Stock ID',
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                    ),
                                                  ),
                                                  Padding(
                                                    padding: EdgeInsets.all(12.0),
                                                    child: Text(
                                                      'Total Bill',
                                                      style: TextStyle(
                                                        color: Colors.white,
                                                        fontWeight: FontWeight.bold,
                                                      ),
                                                      textAlign: TextAlign.right,
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
                                              ..._filteredBills.asMap().entries.map((entry) {
                                                final index = entry.key;
                                                final bill = entry.value;
                                                return TableRow(
                                                  decoration: BoxDecoration(
                                                    color: index % 2 == 0
                                                        ? Colors.white
                                                        : Colors.grey.shade50,
                                                  ),
                                                  children: [
                                                    Padding(
                                                      padding: const EdgeInsets.all(12.0),
                                                      child: Text(_formatDate(bill.date)),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.all(12.0),
                                                      child: Text(bill.customerName),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.all(12.0),
                                                      child: Text(bill.stockNumber ?? 'N/A'),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.all(12.0),
                                                      child: Text(
                                                        bill.billTotal.toStringAsFixed(2),
                                                        textAlign: TextAlign.right,
                                                      ),
                                                    ),
                                                    Padding(
                                                      padding: const EdgeInsets.all(12.0),
                                                      child: Center(
                                                        child: OutlinedButton(
                                                          onPressed: () => _viewBillDetails(bill),
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

class _BillDetailModal extends StatelessWidget {
  final Bill bill;
  final VoidCallback onClose;
  final String Function(String) formatDate;

  const _BillDetailModal({
    required this.bill,
    required this.onClose,
    required this.formatDate,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.black,
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Bill Details',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: onClose,
                  ),
                ],
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildDetailRow('Customer ID:', bill.customerId),
                    _buildDetailRow('Customer Name:', bill.customerName),
                    _buildDetailRow('Stock Number:', bill.stockNumber ?? 'N/A'),
                    _buildDetailRow('Date:', formatDate(bill.date)),
                    const SizedBox(height: 16),
                    Table(
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
                        ...bill.items.map((item) {
                          final index = bill.items.indexOf(item);
                          return TableRow(
                            decoration: BoxDecoration(
                              color: index % 2 == 0
                                  ? Colors.white
                                  : Colors.grey.shade50,
                            ),
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(item.name),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(
                                  item.bags.toStringAsFixed(0),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Text(
                                  item.unitPrice.toStringAsFixed(2),
                                  textAlign: TextAlign.center,
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
                                bill.billTotal.toStringAsFixed(2),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                                textAlign: TextAlign.right,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onClose,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.black,
                    side: const BorderSide(color: Colors.black),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Close'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

