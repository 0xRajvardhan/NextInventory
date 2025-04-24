'use client'
import { PencilIcon, PrinterIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { deletePurchaseOrder } from '@/app/lib/actions';

// Define a type for the button actions (optional)
type ActionButtonProps = {
  onClick: () => void;
  icon: JSX.Element;
  tooltip: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, tooltip }) => (
  <button
    onClick={onClick}
    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200"
    aria-label={tooltip}
  >
    {icon}
  </button>
);

type ActionButtonsProps = {
  id: string; // Add an id prop to the ActionButtons component
};

const ActionButtons: React.FC<ActionButtonsProps> = ({id}) => {

  const router = useRouter();

  const handleEdit = () => {
    // Handle the edit action (e.g., open an editor, navigate to a page, etc.)
    router.push(`/dashboard/purchaseorders/${id}/edit`);
  };

  const handlePrint = () => {
    // Handle the print action (e.g., open print dialog, generate a PDF, etc.)
    console.log('Print clicked');
  };

  const handleEmail = () => {
    // Handle the email action (e.g., open an email client, send an email, etc.)
    console.log('Email clicked');
  };

  const handleDelete = async () => {
    try {
      // Await the response to resolve the Promise
      const response = await deletePurchaseOrder(id);
  
      // Check if the response indicates success
      if (response.success) {
        // Redirect to another page on successful deletion
        router.push('/dashboard/purchaseorders');
      } else {
        // Handle failure case
        console.error('Deletion failed:', response.message);
        alert(`Deletion failed: ${response.message}`);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('An error occurred:', error);
      alert('An error occurred while deleting the purchase order.');
    }
  };
  

  return (
    <div className="flex space-x-4 border-2 border-gray-300 rounded-lg">
      <ActionButton 
        onClick={handleEdit}
        icon={<PencilIcon className="w-6 h-6 text-blue-500" />}
        tooltip="Edit"
      />
      <ActionButton 
        onClick={handlePrint}
        icon={<PrinterIcon className="w-6 h-6 text-green-500" />}
        tooltip="Print"
      />
      <ActionButton 
        onClick={handleEmail}
        icon={<EnvelopeIcon className="w-6 h-6 text-yellow-500" />}
        tooltip="Email"
      />
      <ActionButton 
        onClick={handleDelete}
        icon={<TrashIcon className="w-6 h-6 text-red-500" />}
        tooltip="Delete"
      />
    </div>
  );
};

export default ActionButtons;
