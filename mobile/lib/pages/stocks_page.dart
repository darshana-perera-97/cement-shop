import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../models/stock.dart';
import '../services/api_service.dart';

class StocksPage extends StatefulWidget {
  const StocksPage({super.key});

  @override
  State<StocksPage> createState() => _StocksPageState();
}

class _StocksPageState extends State<StocksPage> {
  List<Stock> _stocks = [];
  List<Stock> _filteredStocks = [];
  bool _loading = true;
  String? _errorMessage;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchStocks();
    _searchController.addListener(_filterStocks);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _filterStocks() {
    final query = _searchController.text.toLowerCase().trim();
    setState(() {
      if (query.isEmpty) {
        _filteredStocks = _stocks;
      } else {
        _filteredStocks = _stocks.where((stock) {
          final stockId = stock.stockId.toLowerCase();
          return stockId.contains(query);
        }).toList();
      }
    });
  }

  Future<void> _fetchStocks() async {
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

      try {
      final stocks = await ApiService.getStocks();
      setState(() {
        _stocks = stocks;
        _filteredStocks = stocks;
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
        title: const Text('Stocks'),
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
                          onPressed: _fetchStocks,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _stocks.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.info_outline, size: 48, color: Colors.black54),
                            const SizedBox(height: 16),
                            const Text(
                              'No stocks found.',
                              style: TextStyle(fontSize: 16),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchStocks,
                      child: ListView(
                        padding: const EdgeInsets.all(20.0),
                        children: [
                          const Text(
                            'Stocks',
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
                                hintText: 'Search by stock ID',
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
                                '${_filteredStocks.length} stock${_filteredStocks.length != 1 ? 's' : ''} found',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.black54,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          // Stocks Table
                          _filteredStocks.isEmpty
                              ? Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(32.0),
                                    child: Center(
                                      child: Column(
                                        children: [
                                          Icon(Icons.search_off, size: 48, color: Colors.black54),
                                          const SizedBox(height: 16),
                                          const Text(
                                            'No stocks match your search',
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
                                                  'Tokyo',
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
                                                  'Sanstha',
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
                                                  'Atlas',
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
                                                  'Nipon',
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
                                                  'Total Number',
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                  textAlign: TextAlign.center,
                                                ),
                                              ),
                                            ],
                                          ),
                                          ..._filteredStocks.asMap().entries.map((entry) {
                                            final index = entry.key;
                                            final stock = entry.value;
                                            return TableRow(
                                              decoration: BoxDecoration(
                                                color: index % 2 == 0
                                                    ? Colors.white
                                                    : Colors.grey.shade50,
                                              ),
                                              children: [
                                                Padding(
                                                  padding: const EdgeInsets.all(12.0),
                                                  child: Text(stock.stockId),
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.all(12.0),
                                                  child: Text(
                                                    stock.tokyo.toString(),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.all(12.0),
                                                  child: Text(
                                                    stock.sanstha.toString(),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.all(12.0),
                                                  child: Text(
                                                    stock.atlas.toString(),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.all(12.0),
                                                  child: Text(
                                                    stock.nipon.toString(),
                                                    textAlign: TextAlign.center,
                                                  ),
                                                ),
                                                Padding(
                                                  padding: const EdgeInsets.all(12.0),
                                                  child: Text(
                                                    stock.totalNumber.toString(),
                                                    textAlign: TextAlign.center,
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

