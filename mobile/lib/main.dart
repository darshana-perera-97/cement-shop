import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'pages/home_page.dart';
import 'pages/add_customer_page.dart';
import 'pages/view_customers_page.dart';
import 'pages/customer_detail_page.dart';
import 'pages/add_bill_page.dart';
import 'pages/view_bills_page.dart';
import 'pages/add_payments_page.dart';
import 'pages/stocks_page.dart';

void main() {
  runApp(const MyApp());
}

final GoRouter _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/add-customer',
      builder: (context, state) => const AddCustomerPage(),
    ),
    GoRoute(
      path: '/view-customers',
      builder: (context, state) => const ViewCustomersPage(),
    ),
    GoRoute(
      path: '/customer/:customerId',
      builder: (context, state) {
        final customerId = state.pathParameters['customerId']!;
        return CustomerDetailPage(customerId: customerId);
      },
    ),
    GoRoute(
      path: '/add-bill',
      builder: (context, state) => const AddBillPage(),
    ),
    GoRoute(
      path: '/view-bills',
      builder: (context, state) => const ViewBillsPage(),
    ),
    GoRoute(
      path: '/add-payments',
      builder: (context, state) => const AddPaymentsPage(),
    ),
    GoRoute(
      path: '/stocks',
      builder: (context, state) => const StocksPage(),
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Cement App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: Colors.white,
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.deepPurple,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.black,
            side: const BorderSide(color: Colors.black),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.deepPurple,
          foregroundColor: Colors.white,
          elevation: 2,
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(4),
          ),
          filled: false,
        ),
      ),
      routerConfig: _router,
    );
  }
}
