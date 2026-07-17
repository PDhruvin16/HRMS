import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { IPreviewToken } from '../../types/preview';

interface PreviewState {
  preview: IPreviewToken | null;
}

const initialState: PreviewState = {
  preview: null,
};

const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    setPreview: (state, action: PayloadAction<IPreviewToken | null>) => {
      state.preview = action.payload;
    },
    clearPreview: (state) => {
      state.preview = null;
    },
  },
});

export const { setPreview, clearPreview } = previewSlice.actions;
export default previewSlice.reducer;
