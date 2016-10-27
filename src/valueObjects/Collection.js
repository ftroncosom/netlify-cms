import { FOLDER, FILES } from '../constants/collectionTypes';

function formatToExtension(format) {
  return {
    markdown: 'md',
    yaml: 'yml',
    json: 'json',
    html: 'html',
  }[format];
}

function slugFormatter(template, entryData) {
  const date = new Date();
  const entry = (typeof entryData === 'string') ? entryData : entryData.get('title', entryData.get('path'));
  const identifier = entry.match(/([^:\\/]*?)(?:\.([^ :\\/.]*))?$/)[1];
  return template.replace(/\{\{([^\}]+)\}\}/g, (_, name) => {
    switch (name) {
      case 'year':
        return date.getFullYear();
      case 'month':
        return (`0${ date.getMonth() + 1 }`).slice(-2);
      case 'day':
        return (`0${ date.getDate() }`).slice(-2);
      case 'slug':
        return identifier.trim().toLowerCase().replace(/[^a-z0-9\.\-_]+/gi, '-');
      default:
        return identifier.trim().toLowerCase().replace(/[^a-z0-9\.\-_]+/gi, '-');
    }
  });
}

class FolderCollection {
  constructor(collection) {
    this.collection = collection;
  }

  entryFields() {
    return this.collection.get('fields');
  }

  entryPath(slug) {
    return `${ this.collection.get('folder') }/${ slug }.${ this.entryExtension() }`;
  }

  entrySlug(path) {
    return slugFormatter(this.collection.get('slug'), path);
  }

  listMethod() {
    return 'entriesByFolder';
  }

  entryExtension() {
    return this.collection.get('extension') || formatToExtension(this.collection.get('format') || 'markdown');
  }

  allowNewEntries() {
    return this.collection.get('create');
  }
}

class FilesCollection {
  constructor(collection) {
    this.collection = collection;
  }

  entryFields(slug) {
    const file = this.fileForEntry(slug);
    return file && file.get('fields');
  }

  entryPath(slug) {
    const file = this.fileForEntry(slug);
    return file && file.get('file');
  }

  entrySlug(path) {
    const file = this.collection.get('files').filter(f => f.get('file') === path).get(0);
    return file && file.get('name');
  }

  fileForEntry(slug) {
    const files = this.collection.get('files');
    return files.filter(f => f.get('name') === slug).get(0);
  }

  listMethod() {
    return 'entriesByFiles';
  }

  allowNewEntries() {
    return false;
  }
}

export default class Collection {
  constructor(collection) {
    switch (collection.get('type')) {
      case FOLDER:
        this.collection = new FolderCollection(collection);
        break;
      case FILES:
        this.collection = new FilesCollection(collection);
        break;
      default:
        throw ('Unknown collection type: %o', collection.get('type'));
    }
  }

  entryFields(slug) {
    return this.collection.entryFields(slug);
  }

  entryPath(slug) {
    return this.collection.entryPath(slug);
  }

  entrySlug(path) {
    return this.collection.entrySlug(path);
  }

  listMethod() {
    return this.collection.listMethod();
  }

  allowNewEntries() {
    return this.collection.allowNewEntries();
  }
}