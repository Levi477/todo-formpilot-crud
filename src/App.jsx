import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrudClient } from 'deep-iitj-crud';

const client = new CrudClient({
  apiKey: import.meta.env.VITE_CRUD_API_KEY,
  apiUri: import.meta.env.VITE_CRUD_API_URI,
});

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await client.read();
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

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center p-6 overflow-hidden">
      {/* ✨ Soft animated gradient background */}
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
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Todo List</h1>

        {creditsExhausted && (
          <motion.div
            className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>❌ Credits exhausted!</p>
            <a
              href="https://your-crud-platform.com"
              target="_blank"
              className="underline text-blue-700 hover:text-blue-900 font-medium"
            >
              Click here to refill and continue using the app.
            </a>
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
      </motion.div>
    </div>
  );
}
