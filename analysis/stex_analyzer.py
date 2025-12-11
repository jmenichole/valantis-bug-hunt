"""
Valantis STEX Vulnerability Analyzer
Analyzes the 8 legendary vulnerability patterns in STEX contracts
"""

from web3 import Web3
from typing import List, Dict, Any
import json
from datetime import datetime
import os

class STEXAnalyzer:
    """
    Comprehensive analyzer for Valantis STEX vulnerabilities
    Implements 8 legendary vulnerability patterns
    """

    def __init__(self, rpc_url: str = None):
        self.rpc_url = rpc_url or os.getenv('MAINNET_RPC')
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.vulnerabilities = []
        self.patterns = {
            'proxy_init': self._check_proxy_initialization,
            'flash_loan_reentrancy': self._check_flash_loan_reentrancy,
            'oracle_staleness': self._check_oracle_staleness,
            'flash_swap_slippage': self._check_flash_swap_slippage,
            'governance_manipulation': self._check_governance_manipulation,
            'access_control': self._check_access_control,
            'signature_validation': self._check_signature_validation,
            'storage_collision': self._check_storage_collision,
        }

    # Pattern 1: Proxy Initialization Bypass
    def _check_proxy_initialization(self, contract_address: str) -> Dict[str, Any]:
        """
        Check for uninitialized proxy vulnerabilities in Sovereign Pool modules
        """
        result = {
            'pattern': 'Proxy Initialization Bypass',
            'address': contract_address,
            'severity': 'CRITICAL',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            if len(code) < 100:
                result['vulnerable'] = True
                result['details'].append('Potential uninitialized proxy detected')
            
            # Check for initialize function
            if b'initialize' in code or b'__init__' in code:
                result['details'].append('Initialize function found')
            else:
                result['vulnerable'] = True
                result['details'].append('No initialize function detected')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 2: Flash Loan Reentrancy
    def _check_flash_loan_reentrancy(self, contract_address: str) -> Dict[str, Any]:
        """
        Test for reentrancy vulnerabilities in yield asset withdrawal queues
        """
        result = {
            'pattern': 'Flash Loan Reentrancy',
            'address': contract_address,
            'severity': 'CRITICAL',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for flash loan patterns
            flash_patterns = [
                b'flashLoan',
                b'flashMint',
                b'receiveFlashLoan',
            ]

            for pattern in flash_patterns:
                if pattern in code:
                    result['details'].append(f'Flash function found: {pattern.decode()}')

            # Check for reentrancy guards
            if b'nonReentrant' not in code and b'locked' not in code:
                result['vulnerable'] = True
                result['details'].append('No reentrancy guard detected')
            else:
                result['details'].append('Reentrancy guard present')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 3: Oracle Staleness Exploitation
    def _check_oracle_staleness(self, contract_address: str) -> Dict[str, Any]:
        """
        Analyze reference exchange rate staleness
        """
        result = {
            'pattern': 'Oracle Staleness Exploitation',
            'address': contract_address,
            'severity': 'HIGH',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for oracle calls
            oracle_patterns = [
                b'latestRoundData',
                b'latestPrice',
                b'getPrice',
                b'peek',
                b'read',
            ]

            oracle_calls = []
            for pattern in oracle_patterns:
                if pattern in code:
                    oracle_calls.append(pattern.decode())

            if oracle_calls:
                result['details'].append(f'Oracle calls found: {oracle_calls}')
                # Check for freshness validation
                if b'updatedAt' not in code and b'timestamp' not in code:
                    result['vulnerable'] = True
                    result['details'].append('No timestamp validation for oracle data')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 4: Flash Swap Slippage Bypass
    def _check_flash_swap_slippage(self, contract_address: str) -> Dict[str, Any]:
        """
        Test yield-bearing asset swap protection bypass
        """
        result = {
            'pattern': 'Flash Swap Slippage Bypass',
            'address': contract_address,
            'severity': 'HIGH',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for swap functions
            if b'swap' in code or b'exchange' in code:
                result['details'].append('Swap/exchange function detected')
                
                # Check for slippage protection
                slippage_patterns = [
                    b'minAmountOut',
                    b'maxSlippage',
                    b'amountOutMinimum',
                ]
                
                has_protection = any(p in code for p in slippage_patterns)
                if not has_protection:
                    result['vulnerable'] = True
                    result['details'].append('No slippage protection detected')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 5: Governance Manipulation
    def _check_governance_manipulation(self, contract_address: str) -> Dict[str, Any]:
        """
        Check for protocol parameter manipulation vulnerabilities
        """
        result = {
            'pattern': 'Governance Manipulation',
            'address': contract_address,
            'severity': 'CRITICAL',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for governance functions
            governance_patterns = [
                b'setParameter',
                b'updateConfig',
                b'setFee',
                b'setLimit',
                b'proposeGovernance',
            ]

            for pattern in governance_patterns:
                if pattern in code:
                    result['details'].append(f'Governance function found: {pattern.decode()}')

            # Check for access controls
            if b'onlyOwner' not in code and b'onlyGovernance' not in code:
                result['vulnerable'] = True
                result['details'].append('Weak access control on governance functions')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 6: Access Control Bypass
    def _check_access_control(self, contract_address: str) -> Dict[str, Any]:
        """
        Test module permission system vulnerabilities
        """
        result = {
            'pattern': 'Access Control Bypass',
            'address': contract_address,
            'severity': 'CRITICAL',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for access control patterns
            access_patterns = [
                b'require(msg.sender',
                b'require(_msgSender()',
                b'onlyRole',
                b'onlyOwner',
                b'onlyAdmin',
            ]

            found_controls = []
            for pattern in access_patterns:
                if pattern in code:
                    found_controls.append(pattern.decode()[:30])

            if found_controls:
                result['details'].append(f'Access controls found: {found_controls}')
            else:
                result['vulnerable'] = True
                result['details'].append('No access control detected')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 7: Signature Validation Flaws
    def _check_signature_validation(self, contract_address: str) -> Dict[str, Any]:
        """
        Analyze permit function signature vulnerabilities
        """
        result = {
            'pattern': 'Signature Validation Flaws',
            'address': contract_address,
            'severity': 'HIGH',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for signature verification
            if b'permit' in code or b'executeMetaTx' in code:
                result['details'].append('Signature-based function detected')
                
                # Check for proper validation
                validation_patterns = [
                    b'ecrecover',
                    b'checkSignature',
                    b'verifySignature',
                    b'_domainSeparator',
                ]
                
                has_validation = any(p in code for p in validation_patterns)
                if has_validation:
                    result['details'].append('Signature validation present')
                else:
                    result['vulnerable'] = True
                    result['details'].append('Weak or missing signature validation')

        except Exception as e:
            result['error'] = str(e)

        return result

    # Pattern 8: Storage Collision
    def _check_storage_collision(self, contract_address: str) -> Dict[str, Any]:
        """
        Check for storage layout conflicts in modular framework
        """
        result = {
            'pattern': 'Storage Collision Vulnerabilities',
            'address': contract_address,
            'severity': 'HIGH',
            'vulnerable': False,
            'details': [],
        }

        try:
            code = self.w3.eth.get_code(contract_address)
            
            # Check for storage patterns
            storage_patterns = [
                b'slot',
                b'gap',
                b'__gap',
                b'storage',
                b'Layout',
            ]

            found_storage = []
            for pattern in storage_patterns:
                if pattern in code:
                    found_storage.append(pattern.decode())

            if b'__gap' in code:
                result['details'].append('Storage gap pattern found (good practice)')
            else:
                result['vulnerable'] = True
                result['details'].append('No storage gap pattern detected')

            if found_storage:
                result['details'].append(f'Storage references: {found_storage}')

        except Exception as e:
            result['error'] = str(e)

        return result

    def analyze_contract(self, contract_address: str) -> Dict[str, Any]:
        """
        Run all 8 vulnerability patterns against a contract
        """
        if not Web3.is_address(contract_address):
            return {'error': 'Invalid contract address'}

        contract_address = Web3.to_checksum_address(contract_address)

        results = {
            'contract': contract_address,
            'timestamp': datetime.now().isoformat(),
            'patterns': {},
            'summary': {
                'total_patterns': len(self.patterns),
                'vulnerabilities_found': 0,
                'critical_issues': 0,
                'high_issues': 0,
            },
        }

        for pattern_key, pattern_func in self.patterns.items():
            result = pattern_func(contract_address)
            results['patterns'][pattern_key] = result

            if result.get('vulnerable'):
                results['summary']['vulnerabilities_found'] += 1
                if result.get('severity') == 'CRITICAL':
                    results['summary']['critical_issues'] += 1
                elif result.get('severity') == 'HIGH':
                    results['summary']['high_issues'] += 1

        return results

    def analyze_batch(self, contract_addresses: List[str]) -> List[Dict[str, Any]]:
        """
        Analyze multiple contracts
        """
        results = []
        for address in contract_addresses:
            result = self.analyze_contract(address)
            results.append(result)
        return results

    def generate_report(self, analysis_results: Dict[str, Any]) -> str:
        """
        Generate a detailed analysis report
        """
        report = []
        report.append('\n========== STEX Vulnerability Analysis Report ==========\n')
        report.append(f"Contract: {analysis_results['contract']}\n")
        report.append(f"Timestamp: {analysis_results['timestamp']}\n")

        summary = analysis_results['summary']
        report.append(f"\nSummary:")
        report.append(f"  Total Patterns Analyzed: {summary['total_patterns']}")
        report.append(f"  Vulnerabilities Found: {summary['vulnerabilities_found']}")
        report.append(f"  Critical Issues: {summary['critical_issues']}")
        report.append(f"  High Issues: {summary['high_issues']}\n")

        report.append('Pattern Results:\n')
        for pattern_name, pattern_result in analysis_results['patterns'].items():
            status = '🔴 VULNERABLE' if pattern_result['vulnerable'] else '🟢 SAFE'
            report.append(f"  {pattern_result['pattern']}: {status}")
            if pattern_result['details']:
                for detail in pattern_result['details']:
                    report.append(f"    - {detail}")

        return '\n'.join(report)


# Main execution
if __name__ == '__main__':
    analyzer = STEXAnalyzer()
    
    # Example: analyze a contract
    test_address = '0x0000000000000000000000000000000000000000'
    results = analyzer.analyze_contract(test_address)
    print(analyzer.generate_report(results))
