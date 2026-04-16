import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AddressFormData } from "@/types/interfaces/checkout/AddressFormData"
import { useTranslation } from "react-i18next"

interface AddressFormProps {
  title: string
  value: AddressFormData
  onChange: (data: AddressFormData) => void
  errors?: Partial<Record<keyof AddressFormData, string>>
  disabled?: boolean
}

const countries = ["France", "Belgique", "Suisse", "Luxembourg", "Allemagne", "Espagne", "Italie"]

export function AddressForm({ title, value, onChange, errors, disabled = false }: AddressFormProps) {
  const { t } = useTranslation()

  const update = <K extends keyof AddressFormData>(field: K, fieldValue: AddressFormData[K]) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4 flex flex-col gap-4">
      {title ? <p className="text-lg font-medium">{title}</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${title}-firstName`}>{t("firstName")}</Label>
          <Input
            id={`${title}-firstName`}
            value={value.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors?.firstName)}
          />
          {errors?.firstName ? <p className="text-destructive text-sm">{errors.firstName}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-lastName`}>{t("lastName")}</Label>
          <Input
            id={`${title}-lastName`}
            value={value.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors?.lastName)}
          />
          {errors?.lastName ? <p className="text-destructive text-sm">{errors.lastName}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${title}-addressLine1`}>{t("address")}</Label>
        <Input
          id={`${title}-addressLine1`}
          value={value.addressLine1}
          onChange={(event) => update("addressLine1", event.target.value)}
          disabled={disabled}
          aria-invalid={Boolean(errors?.addressLine1)}
        />
        {errors?.addressLine1 ? <p className="text-destructive text-sm">{errors.addressLine1}</p> : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${title}-city`}>{t("city")}</Label>
          <Input
            id={`${title}-city`}
            value={value.city}
            onChange={(event) => update("city", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors?.city)}
          />
          {errors?.city ? <p className="text-destructive text-sm">{errors.city}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-postcode`}>{t("postcode")}</Label>
          <Input
            id={`${title}-postcode`}
            value={value.postcode}
            onChange={(event) => update("postcode", event.target.value)}
            disabled={disabled}
            aria-invalid={Boolean(errors?.postcode)}
          />
          {errors?.postcode ? <p className="text-destructive text-sm">{errors.postcode}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${title}-country`}>{t("country")}</Label>
        <Select
          value={value.country}
          onValueChange={(countryValue) => update("country", countryValue)}
          disabled={disabled}
        >
          <SelectTrigger id={`${title}-country`} className="w-full" aria-invalid={Boolean(errors?.country)}>
            <SelectValue placeholder={t("selectCountry")} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.country ? <p className="text-destructive text-sm">{errors.country}</p> : null}
      </div>
    </div>
  )
}
