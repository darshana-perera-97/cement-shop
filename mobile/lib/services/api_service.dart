import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models/customer.dart';
import '../models/bill.dart';
import '../models/payment.dart';
import '../models/stock.dart';

class ApiService {
  static Future<List<Customer>> getCustomers() async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/customers'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Customer.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load customers');
    }
  }

  static Future<Customer> addCustomer(Customer customer) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/customers'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(customer.toJson()),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);
      return Customer.fromJson(data['customer']);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['error'] ?? 'Failed to add customer');
    }
  }

  static Future<List<Bill>> getBills() async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/bills'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Bill.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load bills');
    }
  }

  static Future<Bill> addBill(Bill bill) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/bills'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(bill.toJson()),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);
      return Bill.fromJson(data['bill'] ?? data);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['error'] ?? 'Failed to add bill');
    }
  }

  static Future<Bill> updateBill(Bill bill) async {
    if (bill.createdAt == null) {
      throw Exception('Bill createdAt is required for update');
    }
    
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}/api/bills'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(bill.toJson()),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Bill.fromJson(data['bill'] ?? data);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['error'] ?? 'Failed to update bill');
    }
  }

  static Future<List<Payment>> getPayments() async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/payments'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Payment.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load payments');
    }
  }

  static Future<Payment> addPayment(Payment payment) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/api/payments'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(payment.toJson()),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = json.decode(response.body);
      return Payment.fromJson(data['payment'] ?? data);
    } else {
      final error = json.decode(response.body);
      throw Exception(error['error'] ?? 'Failed to add payment');
    }
  }

  static Future<List<Stock>> getStocks() async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/api/stocks'));
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Stock.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load stocks');
    }
  }
}

