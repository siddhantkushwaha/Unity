import 'dart:async';
import 'package:flutter/material.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:realm/realm.dart';
import 'package:unity/models.dart';
import 'package:unity/realmUtils.dart';
import 'package:unity/socket/server.dart';

late Realm realm;
late RealmResults<ClipboardItem> items;

final unityServer = SocketServer(8080);

bool isListInitialized = false;
late Function setListState;

// there is a global variable for subscription because it goes out of scope as soon as main's over!
late StreamSubscription sub;

const appTitle = 'Unity';

void main() {
  realm = getRealm();
  items = realm.query<ClipboardItem>('TRUEPREDICATE SORT(timestamp DESC)');
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
    const size = Size(1000, 800);
    appWindow.title = appTitle;
    appWindow.size = size;
    appWindow.minSize = size;
    appWindow.maxSize = size;
    appWindow.show();
  });

  unityServer.init();
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: appTitle,
        theme: ThemeData(
          brightness: Brightness.dark,
          primarySwatch: Colors.blue,
        ),
        themeMode: ThemeMode.dark,
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
      body: MainViewBuilder(),
    );
  }
}

class MainViewBuilder extends StatefulWidget {
  const MainViewBuilder({Key? key}) : super(key: key);

  @override
  State<MainViewBuilder> createState() => _MainViewBuilder();
}

class _MainViewBuilder extends State<MainViewBuilder> {
  ClipboardItem? selectedItem;
  final _rightColumnController = ScrollController();
  void onTapCallback(ClipboardItem item) {
    setState(() {
      selectedItem = item;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          color: Colors.black,
          width: MediaQuery.of(context).size.width * 0.3,
          child: Center(
            child: ListViewBuilder(onTapCallback: onTapCallback),
          ),
        ),
        Expanded(
            child: Container(
          color: Colors.black26,
          width: MediaQuery.of(context).size.width * 0.7,
          child: SingleChildScrollView(
              controller: _rightColumnController,
              child: Text(
                selectedItem?.text ?? "Select an item.",
                style: const TextStyle(color: Colors.white, fontSize: 12),
              )),
        )),
      ],
    );
  }
}

class ListViewBuilder extends StatefulWidget {
  //final void onTapCallback(ClipboardItem item);
  final void Function(ClipboardItem item) onTapCallback;

  const ListViewBuilder({required this.onTapCallback, Key? key})
      : super(key: key);

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
            return GestureDetector(
              child: ClipboardItemView(
                clipboardItem: items[index],
              ),
              onTap: () {
                widget.onTapCallback(items[index]);
              },
            );
          }),
    );
  }
}

class ClipboardItemView extends StatefulWidget {
  const ClipboardItemView({Key? key, required this.clipboardItem})
      : super(key: key);

  final splashColor = const Color.fromARGB(255, 255, 219, 219);
  final genericButtonColor = const Color.fromARGB(255, 193, 193, 193);
  final deleteButtonColor = const Color.fromARGB(255, 186, 0, 13);

  final ClipboardItem clipboardItem;

  @override
  State<StatefulWidget> createState() => _ClipboardItemViewState();
}

class _ClipboardItemViewState extends State<ClipboardItemView> {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            SizedBox(
              height: 100,
              child: ListTile(
                subtitle: Text(
                  widget.clipboardItem.text,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                IconButton(
                  icon: const Icon(Icons.delete),
                  splashRadius: 18,
                  splashColor: widget.splashColor,
                  color: widget.deleteButtonColor,
                  onPressed: () {
                    realm.write(() {
                      realm.delete(widget.clipboardItem);
                    });
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.copy),
                  splashRadius: 18,
                  splashColor: widget.splashColor,
                  color: widget.genericButtonColor,
                  onPressed: () {
                    unityServer.clipboardConnection
                        .copyTextToClipboard(widget.clipboardItem.text);
                  },
                ),
                // IconButton(
                //   icon: const Icon(Icons.visibility),
                //   splashRadius: 18,
                //   splashColor: widget.splashColor,
                //   color: widget.genericButtonColor,
                //   onPressed: () {},
                // ),
                // IconButton(
                //   icon: const Icon(Icons.login),
                //   splashRadius: 18,
                //   splashColor: widget.splashColor,
                //   color: widget.genericButtonColor,
                //   onPressed: () {},
                // ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
