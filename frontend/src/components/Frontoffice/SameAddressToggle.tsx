import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"

interface SameAddressToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function SameAddressToggle({ checked, onChange }: SameAddressToggleProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id="same-address"
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <Label htmlFor="same-address">{t("sameAsBilling")}</Label>
    </div>
  )
}
