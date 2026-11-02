import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
export default function ModalHeader({ designation, isEditing }) {
    return (
        <DialogHeader>
            <DialogTitle>
                {isEditing ? `Edit ${designation}` : `Create ${designation}`}
            </DialogTitle>
            <DialogDescription>
                {isEditing
                    ? `Update the ${designation.toLowerCase()} details below.`
                    : `Fill in the details to create a new ${designation.toLowerCase()}.`}
            </DialogDescription>
        </DialogHeader>
    )
}