// "use client";

// import React, { useState, useRef } from "react";
// import {
//   useFieldArray,
//   useForm,
//   UseFormReturn,
//   UseFormReset,
//   UseFormGetValues,
// } from "react-hook-form";
// import { Item, StatusType } from "@prisma/client";
// import { toast, Bounce, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import PopUp from "@/app/ui/components/poPopUp";
// import { addItemToPO, deleteItemInPO } from "@/app/lib/actions";
// import NumericInput from "../components/RHF/numericInput";
// import CustomSelectInput from "../components/RHF/PurchaseOrderAsyncSelectInput";
// import LineTotal from "@/app/ui/components/lineTotal";
// import Total from "@/app/ui/components/total";
// import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
// import { updateReceived } from "@/app/lib/actions";
// import { PurchaseOrderFormValues } from "@/app/lib/definitions";
// import { WorkOrderSchema } from "@/app/lib/zod";
// import { WorkOrderFormSchema, WorkOrderFormValues} from "@/app/lib/definitions";

// export default function TasksItemsForm({
//   items,
//   workOder,
//   control,
//   errors,
//   getValues,
//   reset,
//   handleSubmit,
//   setError,
// }: {
//   items: Item[];
//   workOder: WorkOrderFormValues;
//   control: UseFormReturn<WorkOrderFormValues>["control"];
//   errors: UseFormReturn<WorkOrderFormValues>["formState"]["errors"];
//   reset: UseFormReset<WorkOrderFormValues>;
//   getValues: UseFormGetValues<WorkOrderFormValues>;
//   handleSubmit: UseFormReturn<WorkOrderFormValues>["handleSubmit"];
//   setError: UseFormReturn<WorkOrderFormValues>["setError"];
// }) {
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "tasks",
//   });

//   const [editIndex, setEditIndex] = useState<number | null>(null);
//   const [addIndex, setAddIndex] = useState<boolean>(false);
//   const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
//   const buttonRef = useRef<HTMLButtonElement>(null);

//   const handleOpenPopup = (index: number) => {
//     setOpenModalIndex(index);
//   };

//   const handleClosePopup = () => {
//     setOpenModalIndex(null);
//   };

//   const handleAdd = () => {
//     // if (!addIndex) {
//     //   append({
//     //     taskId:"",

//     //   });
//     //   setAddIndex(true);
//     //   setEditIndex(fields.length);
//     // }
//   };

//   const handleEdit = (index: number) => {
//     setEditIndex(index);
//   };

//   const handleSave = async (index: number) => {
//     // try {
//     //   const formData = getValues();
//     //   console.log("Form Data on Save:", formData);
//     //   const selectedItem = items.find(
//     //     (item) => item.id === formData.orderItems[index].itemId
//     //   );
//     //   if (selectedItem) {
//     //     const updatedFields = [...formData.orderItems];
//     //     updatedFields[index] = {
//     //       ...updatedFields[index],
//     //       item: {
//     //         partNumber: selectedItem.partNumber,
//     //         name: selectedItem.name,
//     //         description: selectedItem.description,
//     //       },
//     //       totalPrice:
//     //         updatedFields[index].quantity * updatedFields[index].unitCost,
//     //     };
//     //     // const response = await addItemToPO(updatedFields[index], purchaseOrder.id);
//     //     const response = await addItemToPO(updatedFields[index]);
//     //     if (response?.error) {
//     //       console.error("Server error:", response.error);
//     //     } else {
//     //       const newItemId = response?.id;
//     //       if (newItemId) {
//     //         updatedFields[index].id = newItemId;
//     //       }
//     //       reset({ orderItems: updatedFields });
//     //       setEditIndex(null);
//     //       setAddIndex(false);
//     //       toast.success("Item updated successfully");
//     //     }
//     //   } else {
//     //     toast.error("Selected item not found");
//     //   }
//     // } catch (error) {
//     //   console.error("Error while saving:", error);
//     // }
//   };

//   // const handleSave = async (index: number) => {
//   //   console.log(index)
//   //   try {
//   //     handleSubmit(async (formData) => {
//   //       console.log("Form Data on Save:", formData);
//   //       // Retrieve the item details based on the selected itemId
//   //       const selectedItem = items.find(
//   //         (item) => item.id === formData.orderItems[index].itemId
//   //       );

//   //       if (selectedItem) {
//   //         // Update the form data with the selected item's details
//   //         const updatedFields = [...formData.orderItems];
//   //         updatedFields[index] = {
//   //           ...updatedFields[index],
//   //           item: {
//   //             partNumber: selectedItem.partNumber,
//   //             name: selectedItem.name,
//   //             description: selectedItem.description
//   //           },
//   //           totalPrice:
//   //             updatedFields[index].quantity * updatedFields[index].unitCost,
//   //         };

//   //         // Submit the updated form data
//   //         const response = await addItemsToPOs(
//   //           updatedFields[index],
//   //           purchaseOrder.id
//   //         );

//   //         if (response?.error) {
//   //           console.error("Server error:", response.error);
//   //         } else {
//   //           // Assuming response contains the new item id
//   //           const newItemId = response?.id;

//   //           // Update the form data with the new id if it's defined
//   //           if (newItemId) {
//   //             updatedFields[index].id = newItemId;
//   //           }

//   //           // Update the form with the latest data
//   //           // Update the specific field with the latest data
//   //           // updateItem(index, updatedFields);
//   //           reset({ orderItems: updatedFields });
//   //           setEditIndex(null);
//   //           setAddIndex(false);
//   //           toast.success("Item updated successfully");
//   //         }
//   //       } else {
//   //         toast.error("Selected item not found");
//   //       }
//   //     })();
//   //   } catch (error) {
//   //     console.error("Error while saving:", error);
//   //   }
//   // };

//   const handleDelete = async (index: number) => {
//     const orderItemId = getValues();
//     const id = orderItemId.tasks[index].id;
//     try {
//       await deleteItemInPO(id);
//       remove(index);
//       setAddIndex(false);
//       toast.success("Item deleted successfully");
//     } catch (error) {
//       console.error("Error while submitting form data:", error);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditIndex(null);
//     reset();
//   };

//   const handlePopUpSubmit = async (index: number) => {
//     // try {
//     //   const currentQty = getValues(`orderItems.${index}.quantity`);
//     //   const currentRequiredQty = getValues(`orderItems.${index}.requiredQty`);
//     //   if (currentRequiredQty > currentQty) {
//     //     setError(`orderItems.${index}.requiredQty`, {
//     //       type: "server",
//     //       message: "Required quantity cannot be greater than current quantity",
//     //     });
//     //     return;
//     //   }
//     //   await toast.promise(
//     //     updateReceived(
//     //       workOder.id,
//     //       getValues(`orderItems.${index}.id`),
//     //       currentRequiredQty
//     //     ),
//     //     {
//     //       pending: "Updating...",
//     //       success: {
//     //         render({ data }) {
//     //           return data.message;
//     //         },
//     //       },
//     //       error: {
//     //         render({ data }) {
//     //           return "Update failed";
//     //         },
//     //       },
//     //     },
//     //     {
//     //       position: "top-right",
//     //       autoClose: 2000,
//     //     }
//     //   );
//     //   // Get current form data
//     //   const formData = getValues();
//     //   // Update the specific field
//     //   const updatedFields = formData.orderItems.map((field: any, idx: number) =>
//     //     idx === index
//     //       ? { ...field, requiredQty: currentRequiredQty } // Update the field
//     //       : field
//     //   );
//     //   // Reset the form with updated fields
//     //   reset({ orderItems: updatedFields });
//     // } catch (error) {
//     //   toast.error("An error occurred", {
//     //     position: "top-center",
//     //     autoClose: 3000,
//     //   });
//     //   console.error(error);
//     // }
//   };

//   return (
//     <div className="relative">
//       <ToastContainer
//         position="top-left"
//         autoClose={false}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//         transition={Bounce}
//       />
//       <form>
//         <div className="mt-6 shadow-md flow-root">
//           <div className="relative shadow-md sm:rounded-lg">
//             <table className="relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//               <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//                 <tr>
//                   <th scope="col" className="px-6 py-3">
//                     Task
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Parts
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Labor
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Total
//                   </th>
//                   <th scope="col" className="justify-end px-6 py-3">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {fields.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="text-center items-center py-4">
//                       No data available
//                     </td>
//                   </tr>
//                 ) : (
//                   fields.map((field, index) => (
//                     <React.Fragment key={field.id}>
//                       {editIndex === index ? (
//                         <tr>
//                           <td colSpan={5}>
//                             <div className="flex justify-center p-6 w-full">
//                               <div className="flex flex-col w-full mr-4 text-sm font-medium">
//                                 {/* <CustomSelectInput
//                                   className="w-full mb-4"
//                                   labelText="Part"
//                                   labelClassName="flex text-sm font-medium mb-4"
//                                   options={items.map((item) => ({
//                                     label: item.partNumber,
//                                     // value: item.id || item.itemId,
//                                     value: item.id,
//                                     description: item.description,
//                                     quantity: item.quantity,
//                                   }))}
//                                   name={`orderItems.${index}.itemId` as const}
//                                   control={control}
//                                   placeholder="Select equipment..."
//                                   // selectedOption = {selected}
//                                   // setSelectedOption = {setSelected}
//                                   // index={index}
//                                   filterItems={purchaseOrder.orderItems.map(
//                                     (item) => ({
//                                       label: item.item.partNumber,
//                                       // value: item.itemId,
//                                       value: item.itemId,
//                                       description: item.item.description,
//                                       quantity: item.quantity,
//                                     })
//                                   )}
//                                 /> */}
//                                 <div className="flex justify-start">
//                                   <button
//                                     type="button"
//                                     onClick={() => handleSave(index)}
//                                     className="mr-4 text-sm font-medium text-blue-500"
//                                   >
//                                     Save
//                                   </button>
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       if (addIndex) {
//                                         remove(index);
//                                         setAddIndex(false);
//                                       } else {
//                                         handleCancelEdit();
//                                       }
//                                     }}
//                                     className="text-sm font-medium text-red-500"
//                                   >
//                                     Cancel
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       ) : (
//                         <tr className="relative items-center">
//                           <td className="px-6 py-4">
//                             <div className="flex flex-col">
//                               {/* {field.item.partNumber} {field.item.name} */}
//                               <div>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEdit(index)}
//                                   className="mr-auto pl-2 pt-2 text-sm font-medium text-blue-500"
//                                 >
//                                   Edit
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleOpenPopup(index)}
//                                   className="mr-auto pl-2 pt-2 text-sm font-medium text-blue-500"
//                                 >
//                                   Received
//                                 </button>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4"></td>
//                           <td className="px-6 py-4"></td>
//                           <td className="px-6 py-4"></td>
//                           <td className="px-6 py-4"></td>
//                           <td className="px-6 py-4">
//                             <button
//                               type="button"
//                               onClick={() => handleDelete(index)}
//                               className="text-sm font-medium text-red-500"
//                             >
//                               <TrashIcon className="w-5" />
//                             </button>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))
//                 )}
//               </tbody>
//             </table>
//             {/* {workOder.poStatus == "Requisition" && (
//               <div className="flex w-full rounded-md bg-gray-50 p-4 text-blue-500 text-sm font-medium">
//                 <button
//                   type="button"
//                   className="flex items-center gap-2"
//                   onClick={handleAdd}
//                 >
//                   <PlusIcon className="w-5" />
//                   <p>ADD INVENTORY</p>
//                 </button>
//               </div>
//             )} */}
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }
