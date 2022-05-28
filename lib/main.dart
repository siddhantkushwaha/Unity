import 'package:flutter/material.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';

void main() {
  runApp(const MyApp());
  doWhenWindowReady(() {
    const size = Size(300, 600);
    appWindow.title = "Unity";
    appWindow.size = size;
    appWindow.minSize = size;
    appWindow.maxSize = size;
    appWindow.show();
  });
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Unity',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: const <Widget>[
            ClipboardItem(
                text:
                    "This is some random text. This text could be whatever you copy/paste. And we will keep a history of that here. For you to be able to resuse that. :D."),
          ],
        ),
      ),
    );
  }
}

class ClipboardItem extends StatelessWidget {
  const ClipboardItem({Key? key, required this.text}) : super(key: key);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ListTile(
              subtitle: Text(
                text,
                style: const TextStyle(color: Colors.black, fontSize: 14),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                IconButton(
                  icon: const Icon(Icons.delete),
                  splashRadius: 18,
                  splashColor: const Color.fromARGB(255, 255, 219, 219),
                  color: Colors.red,
                  onPressed: () {},
                ),
                IconButton(
                  icon: const Icon(Icons.copy),
                  splashRadius: 18,
                  splashColor: const Color.fromARGB(255, 215, 236, 255),
                  color: Colors.blue,
                  onPressed: () {},
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
