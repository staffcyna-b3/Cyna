import * as Slider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function RangeSliderRadix({
    min,
    max,
    valueMin,
    valueMax,
    onChange,
}: {
    min: number;
    max: number;
    valueMin: number | undefined;
    valueMax: number | undefined;
    onChange: (minV: number, maxV: number) => void;
}) {
    const { t } = useTranslation();
    const a = valueMin ?? min;
    const b = valueMax ?? max;

    const handleChange = (vals: number[]) => {
        const v0 = Math.max(min, Math.min(max, vals[0] ?? min));
        const v1 = Math.max(min, Math.min(max, vals[1] ?? max));
        onChange(Number(v0.toFixed(2)), Number(v1.toFixed(2)));
    };

    const format = (v: number) =>
        Math.abs(v - Math.round(v)) < 0.01
            ? `${Math.round(v)} €`
            : `${v.toFixed(2)} €`;

    return (
        <div className="w-full">
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                min={min}
                max={max}
                value={[a, b]}
                onValueChange={handleChange}
                step={1}
            >
                <Slider.Track className="relative bg-[#0d0a16] h-2 flex-1 rounded-full">
                    <Slider.Range className="absolute bg-gradient-to-r from-[#7b61ff] to-[#2b6ef6] h-2 rounded-full" />
                </Slider.Track>
                <Slider.Thumb
                    className={cn(
                        'block w-4 h-4 bg-white rounded-full shadow-md border border-neutral-700'
                    )}
                />
                <Slider.Thumb
                    className={cn(
                        'block w-4 h-4 bg-white rounded-full shadow-md border border-neutral-700'
                    )}
                />
            </Slider.Root>

            <div className="flex justify-between text-sm text-[#b7bdd9] mt-2">
                <div>
                    {t('min')}: {format(a)}
                </div>
                <div>
                    {t('max')}: {format(b)}
                </div>
            </div>
        </div>
    );
}
