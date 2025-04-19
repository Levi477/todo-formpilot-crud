import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrudClient } from 'deep-iitj-crud';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [apiKey, setApiKey] = useState(import.meta.env.VITE_CRUD_API_KEY || '');
  const [apiUri, setApiUri] = useState(import.meta.env.VITE_CRUD_API_URI || '');
  const [client, setClient] = useState(null);
  const [isValidated, setIsValidated] = useState(false);
  const [authError, setAuthError] = useState('');

  const validateApi = async () => {
    try {
      const tempClient = new CrudClient({ apiKey, apiUri });
      await tempClient.read(); // just a read to check auth
      setClient(tempClient);
      setIsValidated(true);
      setAuthError('');
      fetchTodos(tempClient);
    } catch (err) {
      setAuthError('Invalid API Key or URI. Please check and try again.');
    }
  };

  const fetchTodos = async (clientInstance = client) => {
    try {
      setLoading(true);
      const data = await clientInstance.read();
      setTodos(data);
    } catch (err) {
      if (err.message.includes('402')) {
        setCreditsExhausted(true);
      } else {
        console.log('Failed to fetch todos ', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!input.trim()) return;
    try {
      setLoading(true);
      if (editingId !== null) {
        await client.update(editingId, { value: input });
      } else {
        await client.create({ value: input });
      }
      setInput('');
      setEditingId(null);
      await fetchTodos();
    } catch (err) {
      if (err.message.includes('402')) {
        setCreditsExhausted(true);
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await client.delete(id);
      await fetchTodos();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (todo) => {
    setInput(todo.value);
    setEditingId(todo.id);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 overflow-hidden">
      {/* Background animation */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute w-full h-full bg-gradient-to-tr from-pink-300 via-indigo-300 to-purple-300 blur-3xl opacity-30"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white shadow-2xl rounded-2xl p-8 w-full max-w-xl z-10"
      >
        {!isValidated ? (
          <>
            <h1 className="text-2xl font-bold text-center text-indigo-700 mb-4">Enter API Credentials</h1>
            {authError && (
              <div className="bg-red-100 text-red-700 p-2 mb-3 rounded text-center">
                {authError}
              </div>
            )}
            <input
              type="text"
              placeholder="API URI"
              value={apiUri}
              onChange={(e) => setApiUri(e.target.value)}
              className="w-full mb-3 p-3 border border-indigo-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full mb-4 p-3 border border-indigo-300 rounded-lg"
            />
            <button
              onClick={validateApi}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Validate and Continue
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Todo List</h1>

            {creditsExhausted && (
              <motion.div
                className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>❌ Credits exhausted!</p>
              </motion.div>
            )}

            <div className="flex mb-4 gap-2">
              <input
                className="flex-grow p-3 rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                type="text"
                placeholder="Enter todo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={handleAddOrUpdate}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {editingId !== null ? 'Update' : 'Add'}
              </button>
            </div>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-4"
              >
                <div className="loader mx-auto border-4 border-indigo-400 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
              </motion.div>
            )}

            <ul className="space-y-2">
              <AnimatePresence>
                {todos.map((todo) => (
                  <motion.li
                    key={todo.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="bg-indigo-100 flex justify-between items-center p-3 rounded-lg shadow-sm"
                  >
                    <span>{todo.value}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="text-sm text-yellow-600 hover:text-yellow-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </motion.div>
    </div>
  );
}
