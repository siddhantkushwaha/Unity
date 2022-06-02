import 'dart:async';
import 'package:flutter/material.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:realm/realm.dart';
import 'package:unity/models.dart';
import 'package:unity/realmUtils.dart';
import 'package:unity/socket/client.dart';
import 'package:unity/socket/server.dart';

late Realm realm;
late RealmResults<ClipboardItem> items;

bool isListInitialized = false;
late Function setListState;

// there is a global variable for subscription because it goes out of scope as soon as main's over!
late StreamSubscription sub;

void main() {
  realm = getRealm();
  items = realm.all<ClipboardItem>();
  sub = items.changes.listen((changes) {
    if (changes.inserted.isNotEmpty ||
        changes.deleted.isNotEmpty ||
        changes.modified.isNotEmpty) {
      if (isListInitialized) {
        setListState(() {});
      }
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

  final unityServer = SocketServer();
  unityServer.init();
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
  @override
  Widget build(BuildContext context) {
    isListInitialized = true;
    setListState = setState;

    return Scaffold(
      body: ListView.builder(
          itemCount: items.length,
          itemBuilder: (BuildContext context, int index) {
            return ClipboardItemView(
              clipboardItem: items[index],
            );
          }),
    );
  }
}

class ClipboardItemView extends StatelessWidget {
  const ClipboardItemView({Key? key, required this.clipboardItem})
      : super(key: key);

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
                    realm.write(() {
                      realm.delete(clipboardItem);
                    });
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.copy),
                  splashRadius: 18,
                  splashColor: const Color.fromARGB(255, 215, 236, 255),
                  color: Colors.blue,
                  onPressed: () {
                    copyTextToClipboard(clipboardItem.text);
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

void copyTextToClipboard(String text) {
  // this is a hack, we need to create a json object and serialize to string
  // this does not do json escaping
  String message = '{"messageType":"updateClipboard", "updateMessage": {"type": 1, "text": "$text"}}';
  sendMessage(message, 8000);
}
