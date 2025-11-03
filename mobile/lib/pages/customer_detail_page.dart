import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../models/customer.dart';
import '../models/bill.dart';
import '../models/payment.dart';
import '../services/api_service.dart';

class CustomerDetailPage extends StatefulWidget {
  final String customerId;
  const CustomerDetailPage({super.key, required this.customerId});

  @override
  State<CustomerDetailPage> createState() => _CustomerDetailPageState();
}

class _CustomerDetailPageState extends State<CustomerDetailPage> {
  Customer? _customer;
  List<Bill> _bills = [];
  List<Payment> _payments = [];
  bool _loading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchCustomerData();
  }

  Future<void> _fetchCustomerData() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final customers = await ApiService.getCustomers();
      final customer = customers.firstWhere(
        (c) => c.customerId == widget.customerId,
        orElse: () => throw Exception('Customer not found'),
      );

      final allBills = await ApiService.getBills();
      final customerBills =
          allBills.where((b) => b.customerId == widget.customerId).toList();

      final allPayments = await ApiService.getPayments();
      final customerPayments = allPayments
          .where((p) => p.customerId == widget.customerId)
          .toList();

      setState(() {
        _customer = customer;
        _bills = customerBills;
        _payments = customerPayments;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer Details'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null || _customer == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      _errorMessage ?? 'Customer not found',
                      style: TextStyle(color: Colors.red.shade700),
                      textAlign: TextAlign.center,
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchCustomerData,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Customer Details',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Basic Customer Details
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Basic Details',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                _buildDetailRow('Customer ID:', _customer!.customerId),
                                _buildDetailRow(
                                    'Customer Name:', _customer!.customerName),
                                if (_customer!.location != null)
                                  _buildDetailRow('Location:', _customer!.location!),
                                if (_customer!.contactNumber != null)
                                  _buildDetailRow(
                                      'Contact Number:', _customer!.contactNumber!),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        // Summary Cards
                        Row(
                          children: [
                            Expanded(
                              child: Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Total Bills',
                                        style: TextStyle(
                                          color: Colors.grey.shade600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        ((_customer!.pastBills) +
                                            _bills.fold(0.0,
                                                (sum, bill) => sum + bill.billTotal))
                                            .toStringAsFixed(2),
                                        style: const TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Total Payments',
                                        style: TextStyle(
                                          color: Colors.grey.shade600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        _payments
                                            .fold(0.0,
                                                (sum, payment) => sum + payment.amount)
                                            .toStringAsFixed(2),
                                        style: const TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Card(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'To be Paid',
                                        style: TextStyle(
                                          color: Colors.grey.shade600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        (((_customer!.pastBills) +
                                                _bills.fold(0.0,
                                                    (sum, bill) =>
                                                        sum + bill.billTotal)) -
                                                _payments.fold(0.0,
                                                    (sum, payment) =>
                                                        sum + payment.amount))
                                            .toStringAsFixed(2),
                                        style: TextStyle(
                                          fontSize: 24,
                                          fontWeight: FontWeight.bold,
                                          color: (((_customer!.pastBills) +
                                                      _bills.fold(0.0,
                                                          (sum, bill) =>
                                                              sum + bill.billTotal)) -
                                                  _payments.fold(0.0,
                                                      (sum, payment) =>
                                                          sum + payment.amount)) >
                                              0
                                              ? Colors.red.shade700
                                              : Colors.green.shade700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        // Transaction History
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Transaction History',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                _buildTransactionTable(),
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

  Widget _buildTransactionTable() {
    // Combine bills and payments
    final transactions = <_Transaction>[];
    transactions.addAll(_bills.map((bill) => _Transaction(
          date: bill.date,
          description: 'Bill - Stock: ${bill.stockNumber ?? 'N/A'}',
          payments: 0,
          bills: bill.billTotal,
          type: 'bill',
        )));
    transactions.addAll(_payments.map((payment) => _Transaction(
          date: payment.date,
          description: payment.notes ?? 'Payment',
          payments: payment.amount,
          bills: 0,
          type: 'payment',
        )));

    transactions.sort((a, b) => a.date.compareTo(b.date));

    if (transactions.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Text(
            'No transactions found.',
            style: TextStyle(color: Colors.blue.shade700),
          ),
        ),
      );
    }

    return Table(
      border: TableBorder.all(color: Colors.grey.shade300),
      children: [
        TableRow(
          decoration: BoxDecoration(color: Colors.grey.shade800),
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
                'Description',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(12.0),
              child: Text(
                'Payments',
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
                'Bills',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.right,
              ),
            ),
          ],
        ),
        ...transactions.map((transaction) {
          final index = transactions.indexOf(transaction);
          return TableRow(
            decoration: BoxDecoration(
              color: index % 2 == 0 ? Colors.white : Colors.grey.shade50,
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(_formatDate(transaction.date)),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(transaction.description),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(
                  transaction.payments > 0
                      ? transaction.payments.toStringAsFixed(2)
                      : '-',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    color: transaction.type == 'payment'
                        ? Colors.green.shade700
                        : Colors.grey.shade600,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Text(
                  transaction.bills > 0
                      ? transaction.bills.toStringAsFixed(2)
                      : '-',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    color: transaction.type == 'bill'
                        ? Colors.red.shade700
                        : Colors.grey.shade600,
                  ),
                ),
              ),
            ],
          );
        }).toList(),
      ],
    );
  }
}

class _Transaction {
  final String date;
  final String description;
  final double payments;
  final double bills;
  final String type;

  _Transaction({
    required this.date,
    required this.description,
    required this.payments,
    required this.bills,
    required this.type,
  });
}

