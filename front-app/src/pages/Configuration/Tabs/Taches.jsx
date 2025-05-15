import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

function Taches  () {
    const initialData = {
        tasks: {
            "task-1": { id: "task-1", content: "Design a new logo", tag: "ISSUE", date: "Jan 25", users: ["👤", "👤"] },
            "task-2": { id: "task-2", content: "Write a blog post", tag: "FEATURE", users: ["👤"] },
            "task-3": { id: "task-3", content: "Usability testing", tag: "BUG", users: ["👤", "👤", "👤"] },
            "task-4": { id: "task-4", content: "Brainstorm ideas", tag: "TASK", users: [] },
            "task-5": { id: "task-5", content: "Franck Gallagher", tag: "TASK", users: [] },
            "task-6": { id: "task-6", content: "Test tache", tag: "TASK", users: [] },
        },
        columns: {
            "to-do": { id: "to-do", title: "To Do", taskIds: ["task-1", "task-2"] },
            "in-progress": { id: "in-progress", title: "Doing", taskIds: ["task-3"] },
            "done": { id: "done", title: "Done", taskIds: ["task-4","task-5","task-6"] },
            "1": { id: "1", title: "Done", taskIds: [] },
            "2": { id: "2", title: "Done", taskIds: [] },
            "3": { id: "2", title: "Suivant", taskIds: [] },


        },
        columnOrder: ["to-do", "in-progress", "done","1","2"],
    };

    const [data, setData] = useState(initialData);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const start = data.columns[source.droppableId];
        const finish = data.columns[destination.droppableId];

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...start, taskIds: newTaskIds };

            setData({
                ...data,
                columns: {
                    ...data.columns,
                    [newColumn.id]: newColumn,
                },
            });
            return;
        }

        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = { ...start, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finish, taskIds: finishTaskIds };

        setData({
            ...data,
            columns: {
                ...data.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        });
    };

    return (
        <div >
            <h4 style={{
                fontSize: '17px',
                lineHeight: '28px',
                paddingRight: '10px',
                marginBottom: '15px',
                color: '#212529',
                margin: '7px',
            }}>Mes TODO</h4>

                <div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                            <div className="d-flex flex-nowrap">
                                {data.columnOrder.map((columnId) => {
                                    const column = data.columns[columnId];
                                    const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                                    return (
                                        <Droppable key={column.id} droppableId={column.id}>
                                            {(provided) => (
                                                <div
                                                    className="card bg-light shadow-sm mr-3 mb-3"
                                                    style={{ width: '350px', minHeight: '500px', display:'inline-block' }}
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                >
                                                    <div className="card-header text-center font-weight-bold">
                                                        {column.title}
                                                    </div>
                                                    <div className="card-body p-2">
                                                        {tasks.map((task, index) => (
                                                            <Draggable
                                                                key={task.id}
                                                                draggableId={task.id}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}

                                                                        className="bg-white p-3 mb-2 rounded shadow-sm border"
                                                                    >
                                                                        <p className="mb-1 font-weight-bold">
                                                                            {task.content}
                                                                        </p>
                                                                        {task.tag && (
                                                                            <span className="badge badge-info mr-2">
                                                                                {task.tag}
                                                                            </span>
                                                                        )}
                                                                        {task.date && (
                                                                            <small className="text-muted">{task.date}</small>
                                                                        )}
                                                                        <div className="mt-2">
                                                                            {task.users.map((user, i) => (
                                                                                <span key={i} className="badge badge-secondary mr-1">
                                                                                    {user}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </div>
                                                </div>
                                            )}
                                        </Droppable>
                                    );
                                })}
                            </div>
                    </DragDropContext>
                </div>
        </div>
    );
};

export default Taches;