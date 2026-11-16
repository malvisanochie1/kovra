import { nigerianStates, zoneForState } from '@kovra/shared';
import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Sheet } from '@/components/ui/Sheet';
import { colors } from '@/theme/colors';

interface StatePickerProps {
  value: string;
  error?: string;
  onChange: (state: string) => void;
}

/** A field that opens a searchable sheet of all 36 states and the FCT, with delivery times. */
export function StatePicker({ value, error, onChange }: StatePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const states = useMemo(() => nigerianStates.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  return (
    <View className="gap-2">
      <Text className="font-sora-medium text-xs text-mist">State</Text>
      <PressableScale
        onPress={() => setOpen(true)}
        pressedScale={0.98}
        accessibilityLabel={value ? `State: ${value}` : 'Choose your state'}
        className={`h-14 flex-row items-center gap-3 rounded-2xl border bg-ink-2 px-4 ${error ? 'border-danger' : 'border-white/10'}`}
      >
        <Icon name="pin" size={18} color={value ? colors.gold : colors.dim} />
        <Text className={`flex-1 font-sora text-[15px] ${value ? 'text-snow' : 'text-dim'}`}>{value || 'Choose your state'}</Text>
        {value ? <Text className="font-sora text-xs text-mist">{zoneForState(value).eta}</Text> : null}
        <Icon name="down" size={18} color={colors.mist} />
      </PressableScale>
      {error && <Text className="font-sora text-xs text-danger">{error}</Text>}

      <Sheet visible={open} title="Deliver to" onClose={() => setOpen(false)}>
        <View className="mx-6 mb-3 h-12 flex-row items-center gap-3 rounded-xl border border-edge bg-ink px-4">
          <Icon name="search" size={18} color={colors.dim} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search states"
            placeholderTextColor={colors.dim}
            selectionColor={colors.gold}
            className="h-full flex-1 font-sora text-[15px] text-snow outline-none"
          />
        </View>
        <FlatList
          data={states}
          keyExtractor={(item) => item.name}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const zone = zoneForState(item.name);
            const selected = item.name === value;
            return (
              <PressableScale
                onPress={() => {
                  onChange(item.name);
                  setOpen(false);
                  setQuery('');
                }}
                pressedScale={0.98}
                className="flex-row items-center justify-between border-b border-edge py-3.5"
              >
                <Text className={`font-sora-medium text-[15px] ${selected ? 'text-gold' : 'text-snow'}`}>{item.name}</Text>
                <Text className="font-sora text-xs text-mist">{zone.eta}</Text>
              </PressableScale>
            );
          }}
        />
      </Sheet>
    </View>
  );
}
