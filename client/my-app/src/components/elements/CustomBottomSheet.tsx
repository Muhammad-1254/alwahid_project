import BottomSheet from "@gorhom/bottom-sheet"
import { forwardRef, useMemo } from "react"


interface Props {
    children: React.ReactNode
}
type Ref = BottomSheet 

const CustomBottomSheet =forwardRef<Ref,Props>((props,ref)=> {
    const snapPoints = useMemo(() => ["25%", "50%","75%","100%"], []);

return<BottomSheet snapPoints={snapPoints}>
{props.children}
</BottomSheet>
})

export default CustomBottomSheet