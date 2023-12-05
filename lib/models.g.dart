// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'models.dart';

// **************************************************************************
// RealmObjectGenerator
// **************************************************************************

// ignore_for_file: type=lint
class ClipboardItem extends _ClipboardItem
    with RealmEntity, RealmObjectBase, RealmObject {
  ClipboardItem(
    String text,
    int timestamp,
  ) {
    RealmObjectBase.set(this, 'text', text);
    RealmObjectBase.set(this, 'timestamp', timestamp);
  }

  ClipboardItem._();

  @override
  String get text => RealmObjectBase.get<String>(this, 'text') as String;
  @override
  set text(String value) => RealmObjectBase.set(this, 'text', value);

  @override
  int get timestamp => RealmObjectBase.get<int>(this, 'timestamp') as int;
  @override
  set timestamp(int value) => RealmObjectBase.set(this, 'timestamp', value);

  @override
  Stream<RealmObjectChanges<ClipboardItem>> get changes =>
      RealmObjectBase.getChanges<ClipboardItem>(this);

  @override
  ClipboardItem freeze() => RealmObjectBase.freezeObject<ClipboardItem>(this);

  static SchemaObject get schema => _schema ??= _initSchema();
  static SchemaObject? _schema;
  static SchemaObject _initSchema() {
    RealmObjectBase.registerFactory(ClipboardItem._);
    return const SchemaObject(
        ObjectType.realmObject, ClipboardItem, 'ClipboardItem', [
      SchemaProperty('text', RealmPropertyType.string),
      SchemaProperty('timestamp', RealmPropertyType.int),
    ]);
  }
}
