# Task-Fragmentation

AN assignment to test the fragmentation ability of Developers

My Pick - Fragment the UI into selective components to make it more readable

## My Reasons for Fragmentating it like that

### AppTokenBurn Component

Issue: Both onChange and onClick events were triggered in a single element.
Solution: Fragmented the component into multiple parts to separate concerns and improve maintainability. This component can be further fragmented into more granular components for better modularity.

### TopBar and SupplyBar Components

Issue: The respective div elements lacked dedicated states for specific functions.
Solution: Fragmented these components to isolate functionalities and improve component-specific state management.

### SupplyLabel Component

Issue: The div element for the supply violated the DRY Principle.
Solution: Fragmented the SupplyLabel component to adhere to the DRY Principle, making the code more readable and maintainable.
