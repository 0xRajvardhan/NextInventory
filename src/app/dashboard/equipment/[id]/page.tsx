import { notFound } from "next/navigation";
import Breadcrumbs from "@/app/ui/components/breadcrumbs";
import EquipmentForm from "@/app/ui/forms/equipment-form";
import {
  fetchEquipmentById,
  fetchEquipmentPartsById,
  fetchTasksByEquipmentId
} from "@/app/lib/data";
import { GeneralTabs, TabItem } from "@/app/ui/components/tabs";
import { HiAdjustments  } from 'react-icons/hi';
import { FiTool } from "react-icons/fi";
import { MdDashboard } from 'react-icons/md';
import Search from "@/app/ui/search";
import TaskDropdown from "@/app/ui/components/taskDropdown";
import { CalendarIcon, WrenchIcon } from '@heroicons/react/20/solid';
import { TaskDueComponent } from "@/app/ui/components/taskDueCalculation";
import ClickableTableRow from "@/app/ui/components/reusableTabComponent";
import { Divider } from "@nextui-org/react";

export default async function Page({ 
  params, 
  searchParams 
}: { 
  params: { id: string },
  searchParams?: {
    query?: string;
    page?: string;
  };
 }) {
  const id = params.id;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  // const totalPages = await fetchEquipmentPages(query);

  const [
    equipment,
    tasks,
    parts
  ] = await Promise.all([
    fetchEquipmentById(id),
    fetchTasksByEquipmentId(id, query, currentPage),
    fetchEquipmentPartsById(id)
  ]);

  if (!equipment) {
    notFound();
  }
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Equipment", href: "/dashboard/equipment" },
          {
            label: equipment.unitNumber,
            href: "/dashboard/inventory/create",
            active: true,
          },
        ]}
      />
      <Divider className="border border-solid border-1 mb-4" />
        <div className="w-full">
          <p className="capitalize">{equipment.description.toLowerCase()}</p>
          <div className="flex items-center mb-4">
            <p>
              {equipment.primaryMeter?.value} {equipment.primaryMeterReading}
            </p>
            <p>&nbsp;</p>
            <p>
              {equipment.secondaryMeter?.value} {equipment.secondaryMeterReading}
            </p>
          </div>
        </div>
      <Divider className="border border-solid border-1" />
      <GeneralTabs>
        <TabItem title="Details" icon={<HiAdjustments className='w-5 h-5'/>}>
          <div className="w-1/2 rounded-md bg-gray-50 p-6">
            <h1 className="font-bold mb-4">Identification</h1> {/* Title */}
            {/* Unit # */}
            <div className="flex justify-left items-center mr-6 mb-4">
              <label htmlFor="unitNumber" className="w-36 text-sm font-medium">
                Unit #
              </label>
              <p>{equipment.unitNumber}</p>
            </div>             
            {/* Description */}
            <div className="flex justify-left items-center mr-6 mb-4">
              <label htmlFor="Description" className="w-36 text-sm font-medium">
                Description
              </label>
              <p>{equipment.description}</p>
            </div>             
            {/* Yr / Make / Model */}
            <div className="flex justify-left items-center mr-6 mb-4">
              <label htmlFor="Description" className="w-36 text-sm font-medium">
                Yr / Make / Model
              </label>
              <p>{equipment.year} {equipment.make?.label} {equipment.model?.label}</p>
            </div>             
            {/* Yr / Make / Model */}
            <div className="flex justify-left items-center mr-6 mb-4">
              <label htmlFor="Description" className="w-36 text-sm font-medium">
                Keywords
              </label>
              <p>{equipment.keywords}</p>
            </div>             
            {/* Serial */}
            <div className="flex justify-left items-center mr-6 mb-4">
              <label htmlFor="Description" className="w-36 text-sm font-medium">
                Serial Number
              </label>
              <p>{equipment.serial}</p>
            </div>             
          </div>   
        </TabItem>
        <TabItem title="Tasks" icon={<MdDashboard className='w-5 h-5'/>}>
          <div className="flex justify-end gap-4">
            <Search placeholder="Search task..."/>
            <TaskDropdown/>
          </div>
          <div className="mt-6 shadow-md flow-root">
            <div className="relative shadow-md sm:rounded-lg">
              <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Task</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks == null ? (
                    <tr>
                      <td colSpan={5} className="text-center items-center py-4">No tasks available</td>
                    </tr>
                  ) : (
                    <>
                      {tasks && tasks.map((task) => (
                        // Check if the task has a recurringTaskId or repairTaskId to determine its type
                        task.recurringTask ? (
                          // Recurring Task Format
                          <ClickableTableRow
                            key={task.recurringTask.id}
                            href={`/dashboard/equipment/${equipment.id}/recurring/${task.recurringTask.id}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                                {task.recurringTask?.task?.description}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <TaskDueComponent
                                task={task.recurringTask.taskTracking} 
                                equipment={
                                  { primaryMeterReading: equipment.primaryMeterReading, 
                                    secondaryMeterReading: equipment.secondaryMeterReading
                                  }}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p>Recurring/Due:</p>
                                {task.recurringTask.taskTracking?.trackByDate && (
                                  task.recurringTask.taskTracking.trackByDateEvery ? (
                                    // Render date interval if tracking by date
                                    <p>{task.recurringTask.taskTracking?.dateInterval} Days</p>
                                  ) : (
                                    // task.recurringTask.taskTracking?.dateNextDue?.length > 0 &&
                                    task.recurringTask.taskTracking.DateNextDue.map((value, index) => (
                                      <p key={index}>
                                        {new Intl.DateTimeFormat('en-US', { timeZone: 'UTC' }).format(new Date(value.dateNextDue))}
                                      </p>
                                    ))
                                  )
                                  )}
                                {task.recurringTask.taskTracking?.trackByPrimary && (
                                  task.recurringTask.taskTracking.trackByPrimaryEvery ? (
                                    <p>{task.recurringTask.taskTracking?.primaryInterval?.toLocaleString('en-US')} {task.recurringTask.taskTracking.primaryMeterType}</p>
                                  ) : (
                                    <p>
                                      {task.recurringTask.taskTracking?.PrimaryNextDue
                                        ?.map(value => value.primaryNextDue.toLocaleString('en-US')) // Extract the values
                                        .join(' / ')}
                                      {' '}
                                      {task.recurringTask.taskTracking?.primaryMeterType}
                                    </p>
                                  )
                                )}
                                {task.recurringTask.taskTracking?.trackBySecondary && (
                                  task.recurringTask.taskTracking.trackBySecondaryEvery ? (
                                    <p>{task.recurringTask.taskTracking?.secondaryInterval?.toLocaleString('en-US')} {task.recurringTask.taskTracking.secondaryMeterType}</p>
                                  ) : (
                                    <p>
                                      {task.recurringTask.taskTracking?.SecondaryNextDue
                                        ?.map(value => value.secondaryNextDue.toLocaleString('en-US')) // Extract the values
                                        .join(' / ')}
                                      {' '}
                                      {task.recurringTask.taskTracking?.secondaryMeterType}
                                    </p>
                                  )
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <p>Advance Notice:</p>
                                {task.recurringTask.taskTracking?.trackByDate && (
                                  <p>{task.recurringTask.taskTracking.dateAdvanceNotice} Days</p>
                                )}
                                {task.recurringTask.taskTracking?.trackByPrimary && (
                                  <p>{task.recurringTask.taskTracking.primaryAdvanceNotice?.toLocaleString('en-US')} {task.recurringTask.taskTracking.primaryMeterType}</p>
                                )}
                                {task.recurringTask.taskTracking?.trackBySecondary && (
                                  <p>{task.recurringTask.taskTracking.secondaryAdvanceNotice?.toLocaleString('en-US')} {task.recurringTask.taskTracking.secondaryMeterType}</p>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <p>Last Performed:</p>
                                {task.recurringTask.taskTracking?.trackByDate && (
                                  <p>{task.recurringTask.taskTracking.dateLastPerformed?.toDateString()}</p>
                                )}
                                {task.recurringTask.taskTracking?.trackByPrimary && (
                                  <p>{task.recurringTask.taskTracking.primaryLastPerformed} {task.recurringTask.taskTracking.primaryMeterType}</p>
                                )}
                                {task.recurringTask.taskTracking?.trackBySecondary && (
                                  <p>{task.recurringTask.taskTracking.secondaryLastPerformed} {task.recurringTask.taskTracking.secondaryMeterType}</p>
                                )}
                              </div>
                            </td>
                          </ClickableTableRow>
                        ) : task.repairTask ? ( // ✅ Ensure repairTask is not null before rendering
                          <ClickableTableRow
                            key={task.repairTask.id}
                            href={`/dashboard/equipment/${equipment.id}/repair/${task.repairTask.id}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <WrenchIcon className="h-5 w-5 text-gray-500 mr-2" />
                                {task.repairTask?.task?.description}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <TaskDueComponent
                                task={task.repairTask.taskTracking} 
                                equipment={{
                                  primaryMeterReading: equipment.primaryMeterReading, 
                                  secondaryMeterReading: equipment.secondaryMeterReading
                                }}
                              />
                            </td>
                            <td colSpan={3} className="text-left items-center px-6 py-4">
                              Requested by {task.repairTask?.employee?.firstName} {task.repairTask?.employee?.lastName}
                            </td>
                          </ClickableTableRow>
                        ) : null // ✅ If neither `recurringTask` nor `repairTask` exists, return null
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabItem>
        <TabItem title="Parts" icon={<FiTool className='w-5 h-5'/>}>
          <div className="flex justify-end gap-4">
            <Search placeholder="Search task..."/>
            <TaskDropdown/>
          </div>
          <div className="mt-6 shadow-md flow-root">
            <div className="relative shadow-md sm:rounded-lg">
              <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Part #</th>
                    <th scope="col" className="px-6 py-3">Qty Needed</th>
                  </tr>
                </thead>
                <tbody>
                  {parts == null ? (
                    <tr>
                      <td colSpan={5} className="text-center items-center py-4">
                        No parts available
                      </td>
                    </tr>
                  ) : (
                    <>
                      {parts?.length > 0 ? (
                        parts.map((part) => (
                          <ClickableTableRow key={part.id} href={`/dashboard/parts/${part.id}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {part.inventory?.item?.name ?? "Unknown Item"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {part.inventory?.item?.partNumber ?? "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {part.quantity ?? "0"}
                              </div>
                            </td>
                          </ClickableTableRow>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center items-center py-4">
                            No parts available
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabItem>
      </GeneralTabs>
    </main>
  );
}
