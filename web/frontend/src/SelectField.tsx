import {useId} from 'react';
import {Label} from '@/components/ui/label';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';

export function SelectField({label,name,value,onChange,options,placeholder,required=false}:{
  label:string;name:string;value:string;onChange:(value:string)=>void;
  options:{id:string;name:string}[];placeholder?:string;required?:boolean;
}) {
  const id=useId();
  return <div className="space-y-1 text-sm font-medium">
    <Label htmlFor={id}>{label}</Label>
    <Select name={name} value={value} onValueChange={onChange} required={required}>
      <SelectTrigger id={id} aria-label={label} className="w-full font-normal"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map(option=><SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}
