const { v4: uuidv4 } = require('uuid');

const collections = {
  users: [],
  applications: [],
  certificates: [],
  notifications: []
};

function generateId() {
  return uuidv4();
}

function matchDoc(doc, query) {
  for (const key of Object.keys(query)) {
    if (key === '$or') {
      if (!query[key].some(cond => matchDoc(doc, cond))) return false;
      continue;
    }
    if (key === '$and') {
      if (!query[key].every(cond => matchDoc(doc, cond))) return false;
      continue;
    }
    const val = doc[key];
    const qVal = query[key];
    if (qVal && typeof qVal === 'object' && !Array.isArray(qVal) && !(qVal instanceof Date)) {
      if (qVal.$regex) {
        if (!new RegExp(qVal.$regex, qVal.$options || '').test(val || '')) return false;
        continue;
      }
      if (qVal.$in) { if (!qVal.$in.includes(val)) return false; continue; }
      if (qVal.$ne !== undefined) { if (val === qVal.$ne) return false; continue; }
    }
    if (val !== qVal) return false;
  }
  return true;
}

function createQueryChain(arr) {
  let result = [...arr];
  const chain = {
    sort(spec) {
      const keys = Object.keys(spec);
      result.sort((a, b) => {
        for (const k of keys) {
          if (a[k] < b[k]) return spec[k] === 1 ? -1 : 1;
          if (a[k] > b[k]) return spec[k] === 1 ? 1 : -1;
        }
        return 0;
      });
      return chain;
    },
    skip(n) { result = result.slice(n); return chain; },
    limit(n) { result = result.slice(0, n); return chain; },
    populate() { return chain; },
    select() { return chain; },
    then(resolve) { resolve(result); },
    catch() {},
    exec() { return result; }
  };
  return chain;
}

function selectFields(data, fields) {
  if (typeof fields === 'string' && fields.startsWith('-')) {
    const remove = fields.split(' ').filter(f => f.startsWith('-')).map(f => f.slice(1));
    const out = { ...data };
    remove.forEach(f => delete out[f]);
    return out;
  }
  return data;
}

function makeFindOneResult(found) {
  if (!found) return null;
  const data = { ...found };
  const result = { ...data };
  result.select = function(fields) { return selectFields(data, fields); };
  result.populate = function() { return result; };
  result.sort = function() { return result; };
  return result;
}

function makeFindByIdResult(found) {
  if (!found) return null;
  const data = { ...found };
  const result = { ...data };
  result.select = function(fields) { return selectFields(data, fields); };
  result.populate = function() { return result; };
  result.save = async function() {
    const idx = collections[data._coll].findIndex(d => d._id === data._id);
    const plain = { ...data };
    delete plain.select; delete plain.populate; delete plain.save; delete plain.toObject;
    if (idx >= 0) collections[data._coll][idx] = plain;
    else collections[data._coll].push(plain);
    return result;
  };
  result.toObject = function() { return { ...data }; };
  return result;
}

function getModel(name) {
  const coll = name.toLowerCase() + 's';
  if (!collections[coll]) collections[coll] = [];

  function ModelFn(data) {
    const doc = { _id: generateId(), ...data, createdAt: new Date(), _coll: coll };
    let saved = false;
    const inst = {
      ...doc,
      save: async function() {
        if (!saved) { collections[coll].push(doc); saved = true; }
        else {
          const idx = collections[coll].findIndex(d => d._id === doc._id);
          if (idx >= 0) collections[coll][idx] = { ...doc };
        }
        return inst;
      },
      remove: async function() {
        const idx = collections[coll].findIndex(d => d._id === doc._id);
        if (idx >= 0) collections[coll].splice(idx, 1);
      }
    };
    return inst;
  }

  ModelFn.find = function(query) {
    return createQueryChain(collections[coll].filter(d => matchDoc(d, query || {})));
  };

  ModelFn.findOne = function(query) {
    return makeFindOneResult(collections[coll].find(d => matchDoc(d, query || {})));
  };

  ModelFn.findById = function(id) {
    return makeFindByIdResult(collections[coll].find(d => d._id === id));
  };

  ModelFn.create = async function(data) {
    const doc = { _id: generateId(), ...data, createdAt: new Date() };
    collections[coll].push(doc);
    return doc;
  };

  ModelFn.insertMany = async function(docs) {
    const inserted = docs.map(d => ({ _id: generateId(), ...d, createdAt: new Date() }));
    collections[coll].push(...inserted);
    return inserted;
  };

  ModelFn.countDocuments = async function(query) {
    if (!query || Object.keys(query).length === 0) return collections[coll].length;
    return collections[coll].filter(d => matchDoc(d, query)).length;
  };

  ModelFn.deleteOne = async function(query) {
    const idx = collections[coll].findIndex(d => matchDoc(d, query));
    if (idx >= 0) collections[coll].splice(idx, 1);
    return { deletedCount: idx >= 0 ? 1 : 0 };
  };

  ModelFn.updateMany = async function(query, update) {
    let count = 0;
    for (const doc of collections[coll]) {
      if (matchDoc(doc, query)) {
        if (update.$set) Object.assign(doc, update.$set);
        if (update.$inc) {
          for (const [k, v] of Object.entries(update.$inc)) doc[k] = (doc[k] || 0) + v;
        }
        count++;
      }
    }
    return { modifiedCount: count };
  };

  ModelFn.aggregate = async function(pipeline) {
    let data = [...collections[coll]];
    for (const stage of pipeline) {
      if (stage.$match) data = data.filter(d => matchDoc(d, stage.$match));
      if (stage.$group) {
        const groups = {};
        for (const doc of data) {
          let key;
          if (stage.$group._id === null) key = '__null__';
          else if (typeof stage.$group._id === 'object') {
            key = Object.entries(stage.$group._id).map(([k, v]) => `${k}:${doc[v.replace('$', '')]}`).join('|');
          } else key = doc[stage.$group._id.replace('$', '')] || '__null__';
          if (!groups[key]) {
            groups[key] = { _id: stage.$group._id === null ? null : {} };
            if (typeof stage.$group._id === 'object') {
              for (const [k, v] of Object.entries(stage.$group._id)) groups[key]._id[k] = doc[v.replace('$', '')];
            } else if (stage.$group._id !== null) groups[key]._id = key;
          }
          for (const [k, v] of Object.entries(stage.$group)) {
            if (k === '_id') continue;
            if (v.$sum !== undefined) groups[key][k] = (groups[key][k] || 0) + (v.$sum === 1 ? 1 : (doc[v.$sum.replace('$', '')] || 0));
          }
        }
        data = Object.values(groups);
      }
      if (stage.$sort) {
        const keys = Object.keys(stage.$sort);
        data.sort((a, b) => {
          for (const k of keys) {
            if (a[k] < b[k]) return stage.$sort[k] === 1 ? -1 : 1;
            if (a[k] > b[k]) return stage.$sort[k] === 1 ? 1 : -1;
          }
          return 0;
        });
      }
      if (stage.$limit) data = data.slice(0, stage.$limit);
    }
    return data;
  };

  return ModelFn;
}

async function seedData() {
  const bcrypt = require('bcryptjs');
  const adminExists = collections.users.find(u => u.role === 'admin');
  if (!adminExists) {
    collections.users.push({
      _id: generateId(), name: 'Administrator', registerNumber: 'ADMIN001',
      department: 'Administration', course: 'N/A', year: 1, semester: 1,
      email: 'admin@gct.edu', mobile: '9999999999',
      password: await bcrypt.hash('admin123', 10), role: 'admin', createdAt: new Date()
    });
    console.log('Admin account created (admin@gct.edu / admin123)');
  }
  if (collections.users.filter(u => u.role === 'student').length === 0) {
    collections.users.push(
      { _id: generateId(), name: 'Arun Kumar', registerNumber: '2021001', department: 'Computer Science', course: 'B.Tech', year: 4, semester: 7, email: 'arun@gct.edu', mobile: '9876543210', password: await bcrypt.hash('password123', 10), role: 'student', createdAt: new Date() },
      { _id: generateId(), name: 'Priya Shankar', registerNumber: '2021002', department: 'Computer Science', course: 'B.Tech', year: 4, semester: 7, email: 'priya@gct.edu', mobile: '9876543211', password: await bcrypt.hash('password123', 10), role: 'student', createdAt: new Date() }
    );
    console.log('Sample student accounts created');
  }
}

module.exports = { getModel, seedData, collections };
