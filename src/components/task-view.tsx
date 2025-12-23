import { TaskDto } from "@/app/game/[id]/task.dto";


export function TaskView({tasks}: {tasks: TaskDto[]}) {
return (
    <div className="h-full overflow-y-auto">    
        {tasks.map((task) => (  
            <div key={task.id} className="p-2 m-4 bg-white rounded shadow">
                <h3 className="text-lg text-black font-semibold mb-2">{task.title}</h3>
                <p className="text-gray-700 mb-4">{task.description}</p>
                <p className={`font-medium ${task.isCompleted ? 'text-green-600' : 'text-red-600'}`}>
                    {task.isCompleted ? 'Completed' : 'Incomplete'}
                </p>
            </div>
        ))} 
    </div>
)
}