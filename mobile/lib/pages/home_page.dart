import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final navigationCards = [
      {'title': 'Add Customer', 'path': '/add-customer'},
      {'title': 'View Customers', 'path': '/view-customers'},
      {'title': 'Add Bills', 'path': '/add-bill'},
      {'title': 'View Bills', 'path': '/view-bills'},
      {'title': 'Add Payments', 'path': '/add-payments'},
      {'title': 'Stocks', 'path': '/stocks'},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cement App'),
      ),
      body: Container(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            const Text(
              'Home',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w700,
                color: Colors.black,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 32),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                ),
                itemCount: navigationCards.length,
                itemBuilder: (context, index) {
                  final card = navigationCards[index];
                  return Card(
                    child: InkWell(
                      onTap: () => context.go(card['path']!),
                      borderRadius: BorderRadius.circular(12),
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            card['title']!,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                              letterSpacing: 0.2,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

