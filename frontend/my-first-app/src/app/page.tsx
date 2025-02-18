'use client'

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Trash, Check } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: uuidv4(), text: "Buy groceries", completed: false },
    { id: uuidv4(), text: "Read a book", completed: true },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, { id: uuidv4(), text: newTask, completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl space-y-4">
      <h1 className="text-xl font-bold text-center">To-Do List</h1>
      <div className="flex gap-2">
        <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add new task..." />
        <Button onClick={addTask}>Add</Button>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <Card className={`p-2 flex justify-between items-center ${task.completed ? "bg-gray-200" : ""}`}>
              <span className={`flex-1 ${task.completed ? "line-through text-gray-500" : ""}`}>{task.text}</span>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => toggleTask(task.id)}>
                  <Check className="w-5 h-5 text-green-500" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeTask(task.id)}>
                  <Trash className="w-5 h-5 text-red-500" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TodoApp;