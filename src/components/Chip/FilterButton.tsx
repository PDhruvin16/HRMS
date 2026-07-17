// @ts-nocheck
import React, { useState } from 'react';
import { View } from 'react-native';
import { Filter } from 'lucide-react-native';
import Chip from './index';
import FilterModal from '../Modals/FilterModal';
import { SelectOption } from '../Dropdown';
import { colors } from '../../theme/color';

interface FilterButtonProps {
  columns: SelectOption[];
  onApply: (filter: { column: string | number | null; operator: string | number | null }) => void;
  label?: string;
  selectedCount?: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  columns,
  onApply,
  label = 'Filter',
  selectedCount = 0,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <Chip
        label={selectedCount > 0 ? `${label} (${selectedCount})` : label}
        icon={
          <Filter
            size={14}
            color={selectedCount > 0 ? colors.white : colors.convoGray || '#3a3a3fff'}
          />
        }
        onPress={() => setModalVisible(true)}
        selected={selectedCount > 0}
        variant={selectedCount > 0 ? 'filled' : 'outline'}
      />
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApply={onApply}
        columns={columns}
      />
    </View>
  );
};

export default FilterButton;
