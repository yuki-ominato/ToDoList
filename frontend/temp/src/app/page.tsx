'use client'

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Trash, Check } from "lucide-react";

interface Task {
  id: number;
  task: string;
  is_complete: number;
  due_date: string | null;
}

const API_URL = "http://localhost:8000";

const TodoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // タスク一覧の取得
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("タスクの取得に失敗しました:", error);
    }
  };

  // 初回読み込み時にタスクを取得
  useEffect(() => {
    fetchTasks();
  }, []);

  // タスクの追加
  const addTask = async () => {
    if (newTask.trim() === "") return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: newTask,
          is_complete: 0,
          due_date: newDueDate || null,
          id: null
        }),
      });

      if (response.ok) {
        fetchTasks(); // タスク一覧を再取得
        setNewTask("");
        setNewDueDate("");
      }
    } catch (error) {
      console.error("タスクの追加に失敗しました:", error);
    }
  };

  // タスクの完了状態を切り替え
  const toggleTask = async (task: Task) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          is_complete: task.is_complete ? 0 : 1,
        }),
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("タスクの更新に失敗しました:", error);
    }
  };

  // タスクの削除
  const removeTask = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
    }
  };

  const calculateRemainingDays = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? `残り${diffDays}日` : "期限切れ";
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl space-y-4">
      <h1 className="text-xl font-bold text-center">To-Do List</h1>
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..." 
        />
        <Input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          placeholder="Due date"
        />
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
            <Card className={`p-2 flex justify-between items-center ${task.is_complete ? "bg-gray-200" : ""}`}>
              <span className={`flex-1 ${task.is_complete ? "line-through text-gray-500" : ""}`}>
                {task.task}
                {task.due_date && (
                  <span className="block text-xs text-gray-500">
                    Due: {task.due_date} ({calculateRemainingDays(task.due_date)})
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => toggleTask(task)}>
                  <Check className={`w-5 h-5 ${task.is_complete ? "text-green-500" : "text-gray-500"}`} />
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