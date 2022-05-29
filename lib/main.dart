import 'dart:async';
import 'package:flutter/material.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:realm/realm.dart';
import 'package:unity/models.dart';
import 'package:unity/realmUtils.dart';

late Realm realm;
late RealmResults<ClipboardItem> items;

// there is a global variable for subscription because it goes out of scope as soon as main's over!
late StreamSubscription sub;

void main() {
  realm = getRealm();
  items = realm.all<ClipboardItem>();
  sub = items.changes.listen((changes) {
    if (changes.inserted.isNotEmpty &&
        changes.deleted.isNotEmpty &&
        changes.modified.isNotEmpty) {
      // how to call set state here

    }
  });

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

void addTestData(realm) {
  for (var i = 1; i <= 10; i++) {
    var item = ClipboardItem("$i This is some text.");
    realm.write(() {
      realm.add(item);
    });
  }
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
        // home: const LoginPage(),
        home: const MainPage());
  }
}

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: ListViewBuilder()),
    );
  }
}

class ListViewBuilder extends StatefulWidget {
  const ListViewBuilder({Key? key}) : super(key: key);

  @override
  State<ListViewBuilder> createState() => _ListViewBuilderState();
}

class _ListViewBuilderState extends State<ListViewBuilder> {
  void onDeleteItem(ClipboardItem item) {
    setState(() {
      realm.write(() {
        realm.delete(item);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ListView.builder(
          itemCount: items.length,
          itemBuilder: (BuildContext context, int index) {
            return ClipboardItemView(
              clipboardItem: items[index],
              onDeleteItem: onDeleteItem,
            );
          }),
    );
  }
}

class ClipboardItemView extends StatelessWidget {
  const ClipboardItemView(
      {Key? key, required this.clipboardItem, required this.onDeleteItem})
      : super(key: key);

  final Function onDeleteItem;
  final ClipboardItem clipboardItem;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            ListTile(
              subtitle: Text(
                clipboardItem.text,
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
                  onPressed: () {
                    onDeleteItem(clipboardItem);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.copy),
                  splashRadius: 18,
                  splashColor: const Color.fromARGB(255, 215, 236, 255),
                  color: Colors.blue,
                  onPressed: () {
                    var item =
                        ClipboardItem("${items.length + 1} This is some text.");
                    realm.write(() {
                      realm.add(item);
                    });
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
