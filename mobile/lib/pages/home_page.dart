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
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: Container(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            const Text(
              'Home',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                itemCount: navigationCards.length,
                itemBuilder: (context, index) {
                  final card = navigationCards[index];
                  return Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: InkWell(
                      onTap: () => context.go(card['path']!),
                      borderRadius: BorderRadius.circular(8),
                      child: Center(
                        child: Text(
                          card['title']!,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
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

